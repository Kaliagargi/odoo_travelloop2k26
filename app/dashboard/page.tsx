import { getCurrentUser } from "@/app/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/app/lib/db"

export const dynamic = "force-dynamic"

export default async function Dashboard() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  const trips = await prisma.trip.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      stops: {
        include: {
          activities: true
        }
      }
    }
  })

  const initials = user.name
    ? user.name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()
    : "??"

  const totalCities = trips.reduce((sum, t) => sum + t.stops.length, 0)

  const totalBudget = trips.reduce((sum, t) =>
    sum + t.stops.flatMap(s => s.activities).reduce((s, a) => s + a.estimatedCost, 0), 0)

  const nextTrip = trips.find(t => new Date(t.startDate) > new Date())
  const daysUntilNext = nextTrip
    ? Math.ceil((new Date(nextTrip.startDate).getTime() - Date.now()) / 86400000)
    : null

  const categoryTotals = trips
    .flatMap(t => t.stops.flatMap(s => s.activities))
    .reduce((acc, a) => {
      acc[a.category] = (acc[a.category] || 0) + a.estimatedCost
      return acc
    }, {} as Record<string, number>)

  const maxCategoryAmount = Math.max(...Object.values(categoryTotals), 1)

  const navItems = [
    { label: "Dashboard", href: "/dashboard", active: true,  icon: "⊞" },
    { label: "My Trips",  href: "/trips",     active: false, icon: "🗺" },
  ]

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", minHeight: "720px" }} className="flex bg-[#F7F6F2]">

      {/* SIDEBAR */}
      <aside className="w-[220px] bg-[#023047] flex flex-col py-7 shrink-0">
        <div className="px-6 pb-8 flex items-center">
          <span className="text-[18px] font-bold text-white tracking-widest">
            TRAVE<span className="font-light">LOOP</span>
          </span>
          <div className="w-[5px] h-[5px] rounded-full bg-[#FFB703] inline-block ml-1" />
        </div>

        <nav className="flex-1 flex flex-col gap-0.5">
          {navItems.map(item => (
            <Link key={item.label} href={item.href}
              className={`flex items-center gap-3 px-6 py-2.5 text-[13px] no-underline transition-colors
                ${item.active
                  ? "bg-white/[0.08] border-l-[3px] border-[#FFB703] text-white font-semibold"
                  : "text-white/45 hover:text-white/70 border-l-[3px] border-transparent"
                }`}>
              <span className="text-[17px] leading-none">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="px-6 pt-5 border-t border-white/[0.08] flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#0077B6] flex items-center justify-center text-[12px] font-bold text-white shrink-0">
            {initials}
          </div>
          <div>
            <p className="text-white text-[12px] font-semibold m-0">{user.name}</p>
            <p className="text-white/40 text-[11px] m-0">Explorer</p>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 p-8 overflow-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-7">
          <div>
            <p className="text-[#888] text-[12px] tracking-[2px] uppercase m-0 mb-1">Good morning ✦</p>
            <h1 className="text-[#023047] text-[26px] font-bold m-0">
              Where to next, {user.name}?
            </h1>
          </div>
          <Link href="/trips/new"
            className="flex items-center gap-2 px-[22px] py-[11px] bg-[#0077B6] text-white no-underline rounded-[10px] text-[13px] font-semibold hover:bg-[#005f8e] transition">
            + Plan New Trip
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3.5 mb-8">
          {[
            { label: "Total Trips",    value: trips.length.toString(),       note: "all time" },
            { label: "Cities Visited", value: totalCities.toString(),         note: "across all trips" },
            { label: "Total Budget",   value: `₹${(totalBudget/1000).toFixed(0)}K`, note: "estimated spend" },
            { label: "Next Trip",      value: daysUntilNext ? `${daysUntilNext}d` : "—",
              note: nextTrip ? nextTrip.title : "No upcoming trips" },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-[12px] p-[18px] border border-[#ECEAE3]">
              <p className="text-[#888] text-[11px] uppercase tracking-[1px] m-0 mb-2">{s.label}</p>
              <p className="text-[#023047] text-[26px] font-bold m-0">{s.value}</p>
              <p className="text-[11px] mt-1.5 m-0 text-[#0077B6]">{s.note}</p>
            </div>
          ))}
        </div>

        {/* Trips + Budget */}
        <div className="grid gap-5 mb-7" style={{ gridTemplateColumns: "1.4fr 1fr" }}>

          {/* Recent trips */}
          <div className="bg-white rounded-[14px] p-[22px] border border-[#ECEAE3]">
            <div className="flex justify-between items-center mb-[18px]">
              <h2 className="text-[#023047] text-[15px] font-bold m-0">My Trips</h2>
              <Link href="/trips" className="text-[#0077B6] text-[12px] no-underline hover:underline">
                View all →
              </Link>
            </div>
            {trips.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-[#888] text-[13px]">No trips yet</p>
                <Link href="/trips/new" className="text-[#0077B6] text-[12px] no-underline hover:underline">
                  Plan your first trip →
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {trips.slice(0, 4).map(t => {
                  const budget = t.stops.flatMap(s => s.activities).reduce((s, a) => s + a.estimatedCost, 0)
                  const isPast    = new Date(t.endDate) < new Date()
                  const isActive  = new Date(t.startDate) <= new Date() && new Date(t.endDate) >= new Date()
                  const badgeText = isPast ? "Completed" : isActive ? "Active" : "Upcoming"
                  const badgeBg   = isPast ? "#F1EFE8" : isActive ? "#E6F1FB" : "#FAEEDA"
                  const badgeColor = isPast ? "#444" : isActive ? "#0077B6" : "#7A5000"

                  return (
                    <Link key={t.id} href={`/trips/${t.id}`}
                      className="flex items-center gap-3.5 p-3.5 bg-[#F7F6F2] rounded-[10px] no-underline hover:bg-[#eeecea] transition">
                      <div className="w-[42px] h-[42px] rounded-[10px] flex items-center justify-center shrink-0 text-[20px] bg-[#0077B6]">
                        ✈️
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[#023047] text-[13px] font-semibold m-0 truncate">{t.title}</p>
                        <p className="text-[#888] text-[11px] m-0 mt-0.5">
                          {new Date(t.startDate).toLocaleDateString()} · {t.stops.length} cities · ₹{budget.toLocaleString("en-IN")}
                        </p>
                      </div>
                      <span className="text-[11px] px-2.5 py-0.5 rounded-[20px] font-semibold shrink-0"
                        style={{ background: badgeBg, color: badgeColor }}>
                        {badgeText}
                      </span>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>

          {/* Budget by category */}
          <div className="bg-[#023047] rounded-[14px] p-[22px] relative overflow-hidden">
            <div className="absolute w-[180px] h-[180px] rounded-full border border-white/[0.06] -top-14 -right-14 pointer-events-none" />
            <div className="absolute w-[100px] h-[100px] rounded-full border border-white/[0.06] bottom-5 -left-7 pointer-events-none" />
            <h2 className="text-white text-[15px] font-bold m-0 mb-1.5 relative">Budget by Category</h2>
            <p className="text-white/45 text-[11px] m-0 mb-5 relative">Across all trips</p>

            {Object.keys(categoryTotals).length === 0 ? (
              <p className="text-white/40 text-[12px]">No activities added yet</p>
            ) : (
              <div className="relative flex flex-col gap-0">
                {Object.entries(categoryTotals).slice(0, 5).map(([cat, amt]) => (
                  <div key={cat} className="mb-3.5">
                    <div className="flex justify-between mb-1.5">
                      <span className="text-white/60 text-[11px]">{cat}</span>
                      <span className="text-white text-[11px] font-semibold">₹{amt.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="bg-white/10 rounded h-1.5">
                      <div className="h-1.5 rounded bg-[#0077B6]"
                        style={{ width: `${(amt / maxCategoryAmount) * 100}%` }} />
                    </div>
                  </div>
                ))}
                <div className="border-t border-white/10 mt-1 pt-3.5 flex justify-between items-center">
                  <span className="text-white/50 text-[12px]">Total Estimate</span>
                  <span className="text-[#FFB703] text-[18px] font-bold">₹{totalBudget.toLocaleString("en-IN")}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className="bg-white rounded-[14px] p-[22px] border border-[#ECEAE3]">
          <h2 className="text-[#023047] text-[15px] font-bold m-0 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "New Trip",     href: "/trips/new", icon: "✈️", gradient: "linear-gradient(135deg,#0077B6,#023047)" },
              { label: "My Trips",     href: "/trips",     icon: "🗺", gradient: "linear-gradient(135deg,#FFB703,#e07b00)" },
              { label: "Explore Cities", href: "/trips/new", icon: "🌍", gradient: "linear-gradient(135deg,#0096C7,#0077B6)" },
              { label: "Logout",       href: "/api/auth/logout", icon: "🚪", gradient: "linear-gradient(135deg,#023047,#012030)" },
            ].map(d => (
              <Link key={d.label} href={d.href}
                className="rounded-[12px] overflow-hidden border border-[#ECEAE3] no-underline cursor-pointer hover:shadow-md transition">
                <div className="h-[90px] flex items-center justify-center text-[36px]"
                  style={{ background: d.gradient }}>
                  {d.icon}
                </div>
                <div className="p-3">
                  <p className="text-[#023047] text-[13px] font-semibold m-0">{d.label}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </main>
    </div>
  )
}