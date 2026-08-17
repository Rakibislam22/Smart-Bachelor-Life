import { use, useEffect, useRef, useState } from 'react';
import { onValue, ref } from 'firebase/database';
import {
    AlertTriangle,
    Droplets,
    Flame,
    Microwave,
    ShieldAlert,
    ThermometerSun,
    Wifi,
    WifiOff,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { db } from '../firebase/firebase.init';
import { AuthContext } from '../provider/AuthContext';

// ESP32 posts /sensors every ~5s. Allow three missed updates before marking it
// offline so a brief Wi-Fi delay does not cause a false Offline status.
const SENSOR_UPDATE_INTERVAL_MS = 5000;
const ONLINE_TIMEOUT_MS = SENSOR_UPDATE_INTERVAL_MS * 3;
const GAS_MAX = 2000;
const GAS_LIMIT = 1600;

const getSensorValue = (value, fallback = 0) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};

const getValidSensorTimestamp = (value) => {
    if (value === null || value === undefined || value === '') {
        return null;
    }

    const parsed = Number(value);
    const normalizedNumeric = Number.isFinite(parsed)
        ? (parsed > 0 && parsed < 1e12 ? parsed * 1000 : parsed)
        : null;
    const dateMs = normalizedNumeric ?? new Date(value).getTime();

    if (!Number.isFinite(dateMs) || dateMs <= 0) {
        return null;
    }

    const now = Date.now();
    if (dateMs > now + 60000) {
        return null;
    }

    return dateMs;
};

const normalizeKey = (key) => String(key || '').trim().replace(/:$/, '').toLowerCase();

const pickValue = (target, keys, fallback = null) => {
    if (!target || typeof target !== 'object') {
        return fallback;
    }

    const entries = Object.entries(target);

    for (const key of keys) {
        const normalizedKey = normalizeKey(key);

        const match = entries.find(([targetKey]) => normalizeKey(targetKey) === normalizedKey);
        if (match) {
            const [, value] = match;
            if (value !== undefined && value !== null && value !== '') {
                return value;
            }
        }
    }

    return fallback;
};

const normalizeBoolean = (value, fallback = false) => {
    if (typeof value === 'boolean') {
        return value;
    }

    if (typeof value === 'string') {
        const lowered = value.toLowerCase().trim();
        if (['true', 'active', 'on', 'yes', 'danger', 'warning'].includes(lowered)) {
            return true;
        }
        if (['false', 'inactive', 'off', 'no', 'safe', 'normal'].includes(lowered)) {
            return false;
        }
    }

    if (typeof value === 'number') {
        return value !== 0;
    }

    return fallback;
};

const formatUpdatedAt = (value) => {
    if (!value) {
        return 'Waiting for live data...';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return 'Waiting for live data...';
    }

    return new Intl.DateTimeFormat('en-BD', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        day: 'numeric',
        month: 'short',
    }).format(date);
};

const getStatusTone = (value, thresholds = {}, isLight = false) => {
    const safeValue = Number(value || 0);

    if (safeValue >= (thresholds.high ?? Infinity)) {
        return isLight
            ? 'bg-red-50 text-red-700 border-red-300'
            : 'bg-red-500/15 text-red-300 border-red-500/30';
    }

    if (safeValue >= (thresholds.warning ?? -Infinity)) {
        return isLight
            ? 'bg-yellow-50 text-yellow-700 border-yellow-300'
            : 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30';
    }

    return isLight
        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
        : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
};

const IoTDashboard = () => {
    const { isLight } = use(AuthContext);
    const [sensors, setSensors] = useState({
        temperature: 0,
        humidity: 0,
        gas: 0,
        updatedAt: null,
    });
    const [warning, setWarning] = useState({
        active: false,
        message: 'No active warning',
        severity: 'normal',
        updatedAt: null,
    });
    const [kitchen, setKitchen] = useState({
        status: 'idle',
        message: 'Kitchen is waiting for updates',
        updatedAt: null,
    });
    const [lastSeenAt, setLastSeenAt] = useState(null);
    const [isOnline, setIsOnline] = useState(false);
    const warningToastShownRef = useRef(false);
    const hasInitialSensorSnapshotRef = useRef(false);
    const previousSensorSignatureRef = useRef(null);

    useEffect(() => {
        const sensorsRef = ref(db, '/sensors');
        const warningRef = ref(db, '/warning');
        const kitchenRef = ref(db, '/kitchen');

        const unsubscribeSensors = onValue(sensorsRef, (snapshot) => {
            const data = snapshot.val();
            const sensorData = data && typeof data === 'object' && !Array.isArray(data) ? data : {};

            const nextTemperature = getSensorValue(
                pickValue(sensorData, ['temperature', 'temp', 'temp:', 'tempC', 'temp_c', 'sensorTemperature', 'valueTemp'], 0),
                0,
            );
            const nextHumidity = getSensorValue(
                pickValue(sensorData, ['humidity', 'humid', 'moisture', 'sensorHumidity'], 0),
                0,
            );
            const nextGas = getSensorValue(
                pickValue(sensorData, ['gas', 'gas:', 'gasLevel', 'co2', 'ppm'], 0),
                0,
            );

            const rawSensorTimestamp = pickValue(
                sensorData,
                ['updatedAt', 'lastUpdated', 'timestamp', 'time', 'updated_at'],
                null,
            );

            const sensorTimestamp = getValidSensorTimestamp(
                rawSensorTimestamp,
            );

            const sensorSignature = JSON.stringify({
                temperature: nextTemperature,
                humidity: nextHumidity,
                gas: nextGas,
                rawTimestamp: rawSensorTimestamp,
                heartbeat: pickValue(sensorData, ['heartbeat', 'sequence', 'seq', 'packetId', 'counter'], null),
            });

            const payloadChanged = previousSensorSignatureRef.current !== sensorSignature;
            previousSensorSignatureRef.current = sensorSignature;

            let resolvedTimestamp = sensorTimestamp;

            // Avoid false "Live" on initial page load when RTDB contains old data but no timestamp.
            // If later payloads change and still have no timestamp, treat that change time as heartbeat.
            if (!resolvedTimestamp && hasInitialSensorSnapshotRef.current && payloadChanged) {
                resolvedTimestamp = Date.now();
            }

            hasInitialSensorSnapshotRef.current = true;

            setSensors({
                temperature: nextTemperature,
                humidity: nextHumidity,
                gas: nextGas,
                updatedAt:
                    sensorTimestamp
                    ?? rawSensorTimestamp
                    ?? resolvedTimestamp,
            });

            if (!resolvedTimestamp) {
                setLastSeenAt(null);
                return;
            }

            const isExpired = Date.now() - resolvedTimestamp > ONLINE_TIMEOUT_MS;
            setLastSeenAt(isExpired ? null : resolvedTimestamp);
        });

        const unsubscribeWarning = onValue(warningRef, (snapshot) => {
            const data = snapshot.val();
            const warningData = data && typeof data === 'object' && !Array.isArray(data) ? data : {};
            const nextActive = normalizeBoolean(pickValue(warningData, ['active', 'isActive', 'alert', 'status'], false), false);
            const nextWarning = {
                active: nextActive || String(pickValue(warningData, ['status', 'state', 'status:'], '')).toLowerCase() === 'active',
                message: pickValue(warningData, ['message', 'message:', 'text', 'description', 'warning'], 'No active warning'),
                severity: pickValue(warningData, ['severity', 'level'], nextActive ? 'high' : 'normal'),
                updatedAt: pickValue(warningData, ['updatedAt', 'lastUpdated', 'timestamp', 'time'], null),
            };

            setWarning(nextWarning);

            if (nextWarning.active && !warningToastShownRef.current) {
                toast.error(nextWarning.message || 'Danger detected in the apartment!');
                warningToastShownRef.current = true;
            }

            if (!nextWarning.active) {
                warningToastShownRef.current = false;
            }
        });

        const unsubscribeKitchen = onValue(kitchenRef, (snapshot) => {
            const data = snapshot.val();
            const kitchenData = data && typeof data === 'object' && !Array.isArray(data) ? data : {};
            const statusValue = pickValue(kitchenData, ['status', 'state', 'mode', 'kitchenStatus', 'status:'], 'idle');
            const normalizedStatus = String(statusValue || 'idle').toLowerCase();
            const isDone = Boolean(
                normalizedStatus.includes('done') ||
                normalizedStatus.includes('complete') ||
                normalizeBoolean(pickValue(kitchenData, ['done', 'cookingDone', 'isDone', 'completed'], false), false)
            );

            setKitchen({
                status: isDone ? 'done' : normalizedStatus || 'idle',
                message: pickValue(kitchenData, ['message', 'message:', 'note', 'description', 'statusText'], isDone ? 'Cooking is complete.' : 'Kitchen is waiting for updates'),
                updatedAt: pickValue(kitchenData, ['updatedAt', 'lastUpdated', 'timestamp', 'time'], null),
            });
        });

        return () => {
            unsubscribeSensors();
            unsubscribeWarning();
            unsubscribeKitchen();
        };
    }, []);

    // Recompute online/offline every second based on the last heartbeat.
    useEffect(() => {
        const check = () => {
            setIsOnline(Boolean(lastSeenAt) && Date.now() - lastSeenAt < ONLINE_TIMEOUT_MS);
        };

        check();
        const interval = setInterval(check, 1000);
        return () => clearInterval(interval);
    }, [lastSeenAt]);

    const hasWarning = warning.active;
    // A warning remains useful after the ESP32 stops sending data, but it is no
    // longer a live emergency. This also keeps a persisted warning from
    // re-locking/blinking the page after a browser refresh while the device is
    // offline.
    const isLiveEmergency = hasWarning && isOnline;
    const isWarningDeviceOffline = hasWarning && !isOnline;
    const warningMessage = isWarningDeviceOffline
        ? `Device went offline while this warning was active: ${warning.message || 'Warning detected'}`
        : warning.message || 'Warning detected';
    const gasIsOverLimit = sensors.gas >= GAS_LIMIT;
    const gasMeter = Math.min((sensors.gas / GAS_MAX) * 100, 100);
    const gasLimitPosition = Math.min((GAS_LIMIT / GAS_MAX) * 100, 100);

    return (
        <div className="relative space-y-6">
            <style>{`
                @keyframes warningBlink {
                    0%, 100% { background-color: rgba(220, 38, 38, 0.10); }
                    50% { background-color: rgba(220, 38, 38, 0.38); }
                }
                .warning-blink {
                    animation: warningBlink 1s ease-in-out infinite;
                }
                @keyframes gasPulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.55; }
                }
                .gas-pulse {
                    animation: gasPulse 1s ease-in-out infinite;
                }
            `}</style>

            {/* Blink only while the warning comes from a currently live device. */}
            {isLiveEmergency && (
                <div className="warning-blink pointer-events-none fixed inset-0 z-0" />
            )}

            <div className="relative z-10 space-y-6">
                {/* Header: title + connectivity pill */}
                <div className="flex items-center justify-between">
                    <h2 className={`text-lg font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>
                        Apartment IoT Dashboard
                    </h2>
                    <div
                        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${isOnline
                            ? isLight
                                ? 'border-emerald-500/40 bg-emerald-50 text-emerald-700'
                                : 'border-emerald-500/30 bg-emerald-500/15 text-emerald-300'
                            : isLight
                                ? 'border-gray-300 bg-gray-100 text-gray-600'
                                : 'border-gray-500/30 bg-gray-500/15 text-gray-300'
                            }`}
                    >
                        {isOnline ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
                        {isOnline ? 'Live' : 'Offline'}
                    </div>
                </div>

                {/* Warning banner - stays fully visible, everything else fades */}
                {hasWarning && (
                    <div
                        className={`rounded-2xl border p-4 shadow-lg ${isLight
                            ? 'border-red-300 bg-red-50 shadow-red-200/60'
                            : 'border-red-500/40 bg-gradient-to-r from-red-500/20 via-red-500/15 to-amber-500/10 shadow-red-500/20'
                            }`}
                    >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-start gap-3">
                                <div className={`rounded-xl p-2 ${isLight ? 'bg-red-100 text-red-600' : 'bg-red-500/20 text-red-200'}`}>
                                    <ShieldAlert className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${isLight ? 'text-red-600' : 'text-red-200'}`}>
                                        {isWarningDeviceOffline ? 'Warning history' : 'Emergency alert'}
                                    </p>
                                    <h3 className={`mt-1 text-xl font-bold ${isLight ? 'text-red-900' : 'text-white'}`}>{warningMessage}</h3>
                                </div>
                            </div>
                            <div
                                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${isLight
                                    ? 'border-red-300 bg-red-100 text-red-700'
                                    : 'border-red-400/30 bg-red-500/15 text-red-100'
                                    }`}
                            >
                                <AlertTriangle className="h-4 w-4" />
                                {isWarningDeviceOffline ? 'Device offline' : 'Active'}
                            </div>
                        </div>
                    </div>
                )}

                {/* Only a live emergency dims the controls. An offline device keeps the
                    warning visible without making the rest of the dashboard look locked. */}
                <div className={`space-y-4 transition-opacity duration-500 ${isLiveEmergency ? 'opacity-30' : 'opacity-100'}`}>
                    {/* Row 1: Temperature + Humidity */}
                    <div className="grid gap-4 grid-cols-2">
                        <div
                            className={`rounded-2xl border p-4 shadow-lg ${isLight ? 'border-gray-200 bg-white text-gray-900 shadow-slate-200/60' : 'border-gray-700 bg-slate-900/80 text-white shadow-slate-900/40'}`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`rounded-xl p-2 inline-flex ${getStatusTone(sensors.temperature, { warning: 32, high: 40 }, isLight)}`}>
                                    <ThermometerSun className="h-5 w-5" />
                                </div>
                                <p className={`text-lg ${isLight ? 'text-gray-600' : 'text-slate-300'}`}>Temperature</p>
                            </div>

                            <div className="mt-5 pl-11">

                                <p className="mt-2 text-3xl font-bold">{sensors.temperature.toFixed(1)}°C</p>
                            </div>
                        </div>

                        <div
                            className={`rounded-2xl border p-4 shadow-lg ${isLight ? 'border-gray-200 bg-white text-gray-900 shadow-slate-200/60' : 'border-gray-700 bg-slate-900/80 text-white shadow-slate-900/40'}`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`rounded-xl p-2 inline-flex ${getStatusTone(sensors.humidity, { warning: 70, high: 85 }, isLight)}`}>
                                    <Droplets className="h-5 w-5" />
                                </div>
                                <p className={`text-lg ${isLight ? 'text-gray-600' : 'text-slate-300'}`}>Humidity</p>
                            </div>

                            <div className="mt-5 pl-11 ">

                                <p className="mt-2 text-3xl font-bold">{sensors.humidity.toFixed(0)}%</p>
                            </div>
                        </div>
                    </div>

                    {/* Row 2: Gas - full width, aligned under the two cards above */}
                    <div
                        className={`rounded-2xl border p-4 shadow-lg ${isLight ? 'border-gray-200 bg-white text-gray-900 shadow-slate-200/60' : 'border-gray-700 bg-slate-900/80 text-white shadow-slate-900/40'}`}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`rounded-xl p-2 ${getStatusTone(sensors.gas, { warning: 4000, high: GAS_LIMIT }, isLight)} ${gasIsOverLimit ? 'gas-pulse' : ''}`}>
                                    <Flame className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className={`text-lg ${isLight ? 'text-gray-600' : 'text-slate-300'}`}>Gas Level</p>
                                    <p className="mt-1 text-3xl font-bold">{sensors.gas.toFixed(0)} ppm</p>
                                </div>
                            </div>
                            {gasIsOverLimit && (
                                <span
                                    className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${isLight
                                        ? 'border-red-300 bg-red-50 text-red-700'
                                        : 'border-red-400/30 bg-red-500/15 text-red-200'
                                        }`}
                                >
                                    <AlertTriangle className="h-3.5 w-3.5" />
                                    Limit exceeded
                                </span>
                            )}
                        </div>

                        <div className="relative mt-4 h-3 overflow-hidden rounded-full bg-slate-700/60">
                            <div
                                className={`h-full rounded-full transition-all duration-500 ${gasIsOverLimit
                                    ? 'bg-red-500'
                                    : 'bg-gradient-to-r from-cyan-400 via-violet-500 to-fuchsia-500'
                                    }`}
                                style={{ width: `${gasMeter}%` }}
                            />
                            {/* Limit marker on the bar */}
                            <div
                                className="absolute top-0 h-full w-[2px] bg-white/70"
                                style={{ left: `${gasLimitPosition}%` }}
                                title={`Limit: ${GAS_LIMIT} ppm`}
                            />
                        </div>
                        <p className={`mt-2 text-xs ${isLight ? 'text-gray-500' : 'text-slate-400'}`}>
                            Limit: {GAS_LIMIT} ppm
                        </p>
                    </div>

                    {/* Row 3: Kitchen status */}
                    <div className={`rounded-2xl border p-5 ${isLight ? 'border-gray-200 bg-white' : 'border-gray-700 bg-slate-900/80'}`}>
                        <div className="flex items-center gap-3">
                            <div
                                className={`rounded-xl p-2 ${kitchen.status === 'done'
                                    ? isLight
                                        ? 'bg-emerald-50 text-emerald-700'
                                        : 'bg-emerald-500/15 text-emerald-300'
                                    : isLight
                                        ? 'bg-amber-50 text-amber-700'
                                        : 'bg-amber-500/15 text-amber-300'
                                    }`}
                            >
                                <Microwave className="h-5 w-5" />
                            </div>
                            <div>
                                <p className={`text-sm ${isLight ? 'text-gray-600' : 'text-slate-300'}`}>Kitchen Status</p>
                                <h3 className={`text-xl font-bold capitalize ${isLight ? 'text-gray-900' : 'text-white'}`}>{kitchen.status || 'idle'}</h3>
                            </div>
                        </div>

                        <div
                            className={`mt-5 rounded-2xl border p-4 ${kitchen.status === 'done'
                                ? isLight
                                    ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                                    : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-100'
                                : isLight
                                    ? 'border-amber-300 bg-amber-50 text-amber-800'
                                    : 'border-amber-500/30 bg-amber-500/10 text-amber-100'
                                }`}
                        >
                            <p className="text-sm font-medium">{kitchen.message || 'Kitchen is waiting for updates'}</p>
                            <p className={`mt-2 text-xs uppercase tracking-[0.18em] ${isLight ? 'text-gray-600' : 'text-slate-300'}`}>
                                Updated: {formatUpdatedAt(kitchen.updatedAt)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IoTDashboard;
