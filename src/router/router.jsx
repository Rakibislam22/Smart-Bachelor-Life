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
import MealLayout from "../layouts/MealLayout";
import DashboardHome from "../pages/dashboard/DashboardHome";
import ManageMembersPage from "../pages/dashboard/ManageMembersPage";
import MealExpensePage from "../pages/dashboard/MealExpensePage";
import TotalExpensePage from "../pages/dashboard/TotalExpensePage";
import DailyMenuPage from "../pages/dashboard/DailyMenuPage";
import BazarPage from "../pages/dashboard/BazarPage";
import PaymentPage from "../pages/dashboard/PaymentPage";
import NotFound from "../pages/NotFound";
import ManagerRoute from "./ManagerRoute";

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
        children: [
            {
                index: true,
                element: <DashboardHome />,
            },
            {
                path: "meal",
                element: <MealLayout />,
            },
            {
                path: "members",
                element: <ManagerRoute><ManageMembersPage /></ManagerRoute>,
            },
            {
                path: "meal-expense",
                element: <MealExpensePage />,
            },
            {
                path: "total-expense",
                element: <TotalExpensePage />,
            },
            {
                path: "menu",
                element: <DailyMenuPage />,
            },
            {
                path: "bazar",
                element: <BazarPage />,
            },
            {
                path: "payment",
                element: <PaymentPage />,
            }
        ]
    },
    {
        path: "*",
        element: <NotFound />,
    }
]);

export default router;