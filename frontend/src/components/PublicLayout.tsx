import { Outlet } from 'react-router-dom'
import { AppHeader } from './AppHeader'

export function PublicLayout() {
    return (
        <>
            <AppHeader />
            <Outlet />
        </>
    )
}