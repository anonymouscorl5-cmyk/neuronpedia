'use client';

import { useGraphContext } from '@/components/provider/graph-provider';
import { useMemo } from 'react';

export default function RoboticGallery() {
  const { selectedGraph } = useGraphContext();

  const galleryUrl = useMemo(() => {
    if (!selectedGraph || !selectedGraph._top_patch_indices) return null;

    // Use trace_id from metadata if available, otherwise fallback to slug parsing
    const traceId = selectedGraph.metadata.trace_id || selectedGraph.metadata.slug.split(/[_-]/).pop() || '0';
    const patches = selectedGraph._top_patch_indices.join(',');
    
    // We point to the local Neuronpedia Visual Proxy (running on 8000)
    return `http://localhost:8000/api/robot-dataset/gallery/${traceId}.jpg?patches=${patches}&t=${Date.now()}`;
  }, [selectedGraph]);

  if (!galleryUrl) return null;

  return (
    <div className="flex h-full w-full flex-col overflow-hidden px-3 py-2">
      <div className="mb-2 flex flex-col items-center justify-center text-center">
        <h3 className="text-lg font-bold text-slate-700">
          Visual Patch Audit
        </h3>
      </div>
      
      <div className="relative flex-1 overflow-hidden rounded-md">
        <img
          src={galleryUrl}
          alt="Robotic Frame Gallery"
          className="h-full w-full object-contain"
          onError={(e) => {
            console.error('Failed to load robotic gallery image');
          }}
        />
      </div>
      
      <div className="mt-1.5 flex flex-row items-center justify-between">
        <div className="text-[9px] text-slate-400 italic leading-tight">
          Top 15 patches that most strongly activated these features.
        </div>
        <div className="flex flex-row items-center gap-x-1 rounded-full bg-slate-100 px-2 py-0.5 text-[9px] text-slate-600 border border-slate-200">
          <div className="h-1.5 w-1.5 rounded-sm bg-[#00ff00]" />
          <span className="leading-none">Active Patches</span>
        </div>
      </div>
    </div>
  );
}
