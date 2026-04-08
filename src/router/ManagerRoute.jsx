import React, { use } from 'react';
import { Navigate, useLocation } from 'react-router';
import Loading from '../component/Loading';
import { AuthContext } from '../provider/AuthContext';
import UnauthorizedAccess from '../pages/UnauthorizedAccess';

const ManagerRoute = ({ children }) => {
    const { user, loading, userRole } = use(AuthContext);
    const location = useLocation();

    if (loading) {
        return <Loading />;
    }

    if (!user) {
        return <Navigate state={location.pathname} to="/auth/login" replace />;
    }

    if ((userRole || '').toLowerCase() !== 'manager') {
        return <UnauthorizedAccess />;
    }

    return children;
};

export default ManagerRoute;