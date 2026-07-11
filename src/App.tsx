import { Outlet, createBrowserRouter, RouterProvider } from 'react-router-dom'
import Layout, { DirtyProvider } from './components/Layout'
import { TripsProvider } from './hooks/useTrips'
import Home from './pages/Home'
import TripDetail from './pages/TripDetail'
import DayDetail from './pages/DayDetail'

function RootLayout() {
  return (
    <DirtyProvider>
      <TripsProvider>
        <Outlet />
      </TripsProvider>
    </DirtyProvider>
  )
}

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        path: '/',
        element: (
          <Layout>
            <Home />
          </Layout>
        ),
      },
      {
        path: '/trip/:tripId',
        element: (
          <Layout showBack>
            <TripDetail />
          </Layout>
        ),
      },
      {
        path: '/trip/:tripId/day/:dayId',
        element: (
          <Layout showBack>
            <DayDetail />
          </Layout>
        ),
      },
    ],
  },
])

function App() {
  return <RouterProvider router={router} />
}

export default App
