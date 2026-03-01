import { createBrowserRouter } from "react-router";
import LandingPage from "../pages/LandingPage";
import MainLayout from "../layouts/MainLayout";
import AuthLayout from "../layouts/AuthLayout";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import Benefits from "../pages/Benefits";
import About from "../pages/About";
import Contact from "../pages/Contact";
import DashboardLayout from "../layouts/DashboardLayout";
import PrivateRoute from "./PrivateRoute";
import GroupSelection from "../pages/GroupSelection";

const router = createBrowserRouter([
    {
        path: "/",
        element: <MainLayout />,
        children: [
            {
                path: "/",
                element: <LandingPage />,
            },
            {
                path: "/benefits",
                element: <Benefits />,
            },
            {
                path: "/about",
                element: <About />,
            },
            {
                path: "/contact",
                element: <Contact />,
            }
        ],
    },
    {
        path: "/auth",
        element: <AuthLayout />,
        children: [
            {
                path: "login",
                element: <Login />,
            },
            {
                path: "signup",
                element: <Signup />,
            }
        ]
    },
    {
        path: "/group-selection",
        element: <GroupSelection />,
    },
    {
        path: "/dashboard",
        element: <PrivateRoute><DashboardLayout /></PrivateRoute>,
    }
]);

export default router;