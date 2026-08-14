import { use, useEffect, useRef, useState } from 'react';
import { onValue, ref } from 'firebase/database';
import { AlertTriangle, Droplets, Flame, Gauge, Microwave, ShieldAlert, ThermometerSun } from 'lucide-react';
import { toast } from 'react-toastify';
import { db } from '../firebase/firebase.init';
import { AuthContext } from '../provider/AuthContext';

const getSensorValue = (value, fallback = 0) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
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

const getStatusTone = (value, thresholds = {}) => {
    const safeValue = Number(value || 0);

    if (safeValue >= (thresholds.high ?? Infinity)) {
        return 'bg-red-500/15 text-red-300 border-red-500/30';
    }

    if (safeValue >= (thresholds.warning ?? -Infinity)) {
        return 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30';
    }

    return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
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
    const warningToastShownRef = useRef(false);

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

            setSensors({
                temperature: nextTemperature,
                humidity: nextHumidity,
                gas: nextGas,
                updatedAt: pickValue(sensorData, ['updatedAt', 'lastUpdated', 'timestamp', 'time', 'updated_at'], null),
            });
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

    const sensorCards = [
        {
            label: 'Temperature',
            value: `${sensors.temperature.toFixed(1)}°C`,
            icon: <ThermometerSun className="h-5 w-5" />,
            tone: getStatusTone(sensors.temperature, { warning: 32, high: 40 }),
            meter: Math.min((sensors.temperature / 60) * 100, 100),
        },
        {
            label: 'Humidity',
            value: `${sensors.humidity.toFixed(0)}%`,
            icon: <Droplets className="h-5 w-5" />,
            tone: getStatusTone(sensors.humidity, { warning: 70, high: 85 }),
            meter: Math.min((sensors.humidity / 100) * 100, 100),
        },
        {
            label: 'Gas',
            value: `${sensors.gas.toFixed(0)} ppm`,
            icon: <Flame className="h-5 w-5" />,
            tone: getStatusTone(sensors.gas, { warning: 200, high: 400 }),
            meter: Math.min((sensors.gas / 600) * 100, 100),
        },
    ];

    const hasWarning = warning.active;

    return (
        <div className="space-y-6">
            {hasWarning && (
                <div className="rounded-2xl border border-red-500/40 bg-gradient-to-r from-red-500/15 via-red-500/10 to-amber-500/10 p-4 shadow-lg shadow-red-500/10">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-3">
                            <div className="rounded-xl bg-red-500/20 p-2 text-red-200">
                                <ShieldAlert className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-200">Emergency Alert</p>
                                <h3 className="mt-1 text-xl font-bold text-white">{warning.message || 'Warning detected'}</h3>
                            </div>
                        </div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-red-400/30 bg-red-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-red-100">
                            <AlertTriangle className="h-4 w-4" />
                            Active
                        </div>
                    </div>
                </div>
            )}

            <div className="grid gap-4 md:grid-cols-3">
                {sensorCards.map((sensor) => (
                    <div
                        key={sensor.label}
                        className={`rounded-2xl border p-4 shadow-lg ${isLight ? 'border-gray-200 bg-white text-gray-900 shadow-slate-200/60' : 'border-gray-700 bg-slate-900/80 text-white shadow-slate-900/40'}`}
                    >
                        <div className="flex items-center justify-between">
                            <div className={`rounded-xl p-2 ${sensor.tone}`}>
                                {sensor.icon}
                            </div>
                            <span className={`rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${sensor.tone}`}>
                                Live
                            </span>
                        </div>

                        <div className="mt-5">
                            <p className={`text-sm ${isLight ? 'text-gray-600' : 'text-slate-300'}`}>{sensor.label}</p>
                            <p className="mt-2 text-3xl font-bold">{sensor.value}</p>
                        </div>

                        <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-700/60">
                            <div
                                className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-violet-500 to-fuchsia-500"
                                style={{ width: `${sensor.meter}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                <div className={`rounded-2xl border p-5 ${isLight ? 'border-gray-200 bg-white' : 'border-gray-700 bg-slate-900/80'}`}>
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-cyan-500/15 p-2 text-cyan-300">
                                <Gauge className="h-5 w-5" />
                            </div>
                            <div>
                                <p className={`text-sm ${isLight ? 'text-gray-600' : 'text-slate-300'}`}>System Snapshot</p>
                                <h3 className={`text-xl font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>Environment Monitor</h3>
                            </div>
                        </div>
                        <span className={`rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${isLight ? 'border-gray-200 bg-gray-100 text-gray-700' : 'border-gray-700 bg-slate-800 text-slate-200'}`}>
                            {formatUpdatedAt(sensors.updatedAt)}
                        </span>
                    </div>

                    <div className="mt-6 space-y-4">
                        <div>
                            <div className="mb-2 flex items-center justify-between text-sm">
                                <span className={isLight ? 'text-gray-600' : 'text-slate-300'}>Temperature</span>
                                <span className={isLight ? 'text-gray-900' : 'text-white'}>{sensors.temperature.toFixed(1)}°C</span>
                            </div>
                            <div className="h-2.5 overflow-hidden rounded-full bg-slate-700/60">
                                <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500" style={{ width: `${Math.min((sensors.temperature / 60) * 100, 100)}%` }} />
                            </div>
                        </div>

                        <div>
                            <div className="mb-2 flex items-center justify-between text-sm">
                                <span className={isLight ? 'text-gray-600' : 'text-slate-300'}>Humidity</span>
                                <span className={isLight ? 'text-gray-900' : 'text-white'}>{sensors.humidity.toFixed(0)}%</span>
                            </div>
                            <div className="h-2.5 overflow-hidden rounded-full bg-slate-700/60">
                                <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500" style={{ width: `${Math.min((sensors.humidity / 100) * 100, 100)}%` }} />
                            </div>
                        </div>

                        <div>
                            <div className="mb-2 flex items-center justify-between text-sm">
                                <span className={isLight ? 'text-gray-600' : 'text-slate-300'}>Gas</span>
                                <span className={isLight ? 'text-gray-900' : 'text-white'}>{sensors.gas.toFixed(0)} ppm</span>
                            </div>
                            <div className="h-2.5 overflow-hidden rounded-full bg-slate-700/60">
                                <div className="h-full rounded-full bg-gradient-to-r from-rose-500 to-red-500" style={{ width: `${Math.min((sensors.gas / 600) * 100, 100)}%` }} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className={`rounded-2xl border p-5 ${isLight ? 'border-gray-200 bg-white' : 'border-gray-700 bg-slate-900/80'}`}>
                    <div className="flex items-center gap-3">
                        <div className={`rounded-xl p-2 ${kitchen.status === 'done' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-amber-500/15 text-amber-300'}`}>
                            <Microwave className="h-5 w-5" />
                        </div>
                        <div>
                            <p className={`text-sm ${isLight ? 'text-gray-600' : 'text-slate-300'}`}>Kitchen Status</p>
                            <h3 className={`text-xl font-bold capitalize ${isLight ? 'text-gray-900' : 'text-white'}`}>{kitchen.status || 'idle'}</h3>
                        </div>
                    </div>

                    <div className={`mt-5 rounded-2xl border p-4 ${kitchen.status === 'done' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-100' : 'border-amber-500/30 bg-amber-500/10 text-amber-100'}`}>
                        <p className="text-sm font-medium">{kitchen.message || 'Kitchen is waiting for updates'}</p>
                        <p className={`mt-2 text-xs uppercase tracking-[0.18em] ${isLight ? 'text-gray-600' : 'text-slate-300'}`}>
                            Updated: {formatUpdatedAt(kitchen.updatedAt)}
                        </p>
                    </div>

                    <div className="mt-5 rounded-2xl border border-red-500/30 bg-red-500/10 p-4">
                        <div className="flex items-center gap-3">
                            <AlertTriangle className="h-5 w-5 text-red-300" />
                            <p className={`text-sm font-medium ${isLight ? 'text-gray-700' : 'text-white'}`}>
                                {warning.active ? warning.message : 'No active safety issue.'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IoTDashboard;
