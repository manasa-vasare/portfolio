const StatusBadge = () => {
    return (
        <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-full backdrop-blur-xl">
            <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                Currently building: <span className="text-emerald-400">Air Canvas</span>
            </span>
        </div>
    )
}

export default StatusBadge
