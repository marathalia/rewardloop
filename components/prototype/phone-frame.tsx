import type { ReactNode } from "react"

export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="relative mx-auto h-[812px] w-[375px] shrink-0 rounded-[3rem] border-[10px] border-[#111] bg-[#111] shadow-2xl">
      {/* notch */}
      <div className="absolute left-1/2 top-0 z-20 h-6 w-36 -translate-x-1/2 rounded-b-2xl bg-[#111]" />
      {/* screen */}
      <div className="phone-screen relative h-full w-full overflow-hidden rounded-[2.3rem] bg-background">{children}</div>
    </div>
  )
}
