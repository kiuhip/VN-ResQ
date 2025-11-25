'use client';

import dynamic from 'next/dynamic';
import { Alert } from '@/lib/api';

const Map = dynamic(() => import('./Map'), {
    ssr: false,
    loading: () => <div className="w-full h-full bg-slate-900 animate-pulse rounded-xl flex items-center justify-center text-slate-500">Initializing Geospatial Data...</div>
});

interface MapWrapperProps {
    alerts: Alert[];
}

export default function MapWrapper({ alerts }: MapWrapperProps) {
    return <Map alerts={alerts} />;
}
