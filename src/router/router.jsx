import { createBrowserRouter } from "react-router";
import LandingPage from "../pages/LandingPage";

const router = createBrowserRouter([
    {
        path: "/",
        element: <LandingPage />,
    },
]);

export default router;