import { useState, useEffect } from "react";
import { 
  format, 
  differenceInMinutes, 
  parse, 
  addHours, 
  addMinutes, 
  subMinutes, 
  startOfWeek, 
  addDays, 
  isSameDay,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isToday as isTodayFns,
  addMonths,
  subMonths,
  getYear,
  getMonth
} from "date-fns";
import { toZonedTime, format as formatTz } from "date-fns-tz";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, LogOut, Coffee, Timer, AlertCircle, RotateCcw, Hourglass, Quote, Calendar as CalendarIcon, Calculator, Settings, Info, ChevronLeft, ChevronRight, X } from "lucide-react";
import { TimeInput } from "@/components/time-input";
import { StatCard } from "@/components/stat-card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ThemeToggle } from "@/components/theme-toggle";
import { useToast } from "@/hooks/use-toast";
import { useServerTime } from "@/hooks/use-time";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const IST_TIMEZONE = 'Asia/Kolkata';

export default function Home() {
  const { toast } = useToast();
  
  // Local State
  const [loginTime, setLoginTime] = useState("09:30 AM");
  const [calculationMode, setCalculationMode] = useState<"login" | "planned">("login");
  const [requiredHours, setRequiredHours] = useState("09");
  const [requiredMinutes, setRequiredMinutes] = useState("00");
  const [now, setNow] = useState(new Date());
  const [quote, setQuote] = useState({ content: "The only way to do great work is to love what you do.", author: "Steve Jobs" });
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [holidays, setHolidays] = useState<string[]>([]);
  
  // Split state for modes
  const [loginModeSettings, setLoginModeSettings] = useState({ isHalfDay: false, shortLeaveCount: "0", shortLeaveDuration: "50" });
  const [plannedModeSettings, setPlannedModeSettings] = useState({ isHalfDay: false, shortLeaveCount: "0", shortLeaveDuration: "50" });

  const currentSettings = calculationMode === "login" ? loginModeSettings : plannedModeSettings;
  const setSettings = (updates: Partial<typeof loginModeSettings>) => {
    if (calculationMode === "login") {
      setLoginModeSettings(prev => ({ ...prev, ...updates }));
    } else {
      setPlannedModeSettings(prev => ({ ...prev, ...updates }));
    }
  };

  const [plannedOutTime, setPlannedOutTime] = useState("06:30 PM");
  
  // Derived State
  const [logoutTimeStr, setLogoutTimeStr] = useState<string>("");
  const [requiredArrivalTime, setRequiredArrivalTime] = useState<string>("");
  const [remainingTimeStr, setRemainingTimeStr] = useState<string>("");
  const [isOvertime, setIsOvertime] = useState(false);
  const [isNotStarted, setIsNotStarted] = useState(false);
  const [progress, setProgress] = useState(0);

  const fetchQuote = async () => {
    try {
      const response = await fetch(
				"https://api.api-ninjas.com/v2/randomquotes?categories=success,wisdom",
				{
					headers: { "X-Api-Key": "ZOGjV1dLvOMumAfmR5AHDcwb7Kad2awiFaIRzkE4" },
				},
			);
      if (response.ok) {
        const req = await response.json();
        const data = req[0];
        setQuote({ content: data.quote, author: data.author });
      }
    } catch (e) {
      console.error("Quote fetch failed", e);
    }
  };

  // Load persistence
  useEffect(() => {
    const savedLogin = localStorage.getItem("work-tracker-login");
    const savedMode = localStorage.getItem("work-tracker-mode") as "login" | "planned";
    const savedHours = localStorage.getItem("work-tracker-hours");
    const savedMinutes = localStorage.getItem("work-tracker-minutes");
    const savedPlannedOut = localStorage.getItem("work-tracker-planned-out");
    const savedHolidays = localStorage.getItem("work-tracker-holidays");
    
    const savedLoginSettings = localStorage.getItem("work-tracker-login-settings");
    const savedPlannedSettings = localStorage.getItem("work-tracker-planned-settings");
    
    if (savedLogin) setLoginTime(savedLogin);
    if (savedMode) setCalculationMode(savedMode);
    if (savedHours) setRequiredHours(savedHours);
    if (savedMinutes) setRequiredMinutes(savedMinutes);
    if (savedPlannedOut) setPlannedOutTime(savedPlannedOut);
    if (savedHolidays) setHolidays(JSON.parse(savedHolidays));
    
    if (savedLoginSettings) setLoginModeSettings(JSON.parse(savedLoginSettings));
    if (savedPlannedSettings) setPlannedModeSettings(JSON.parse(savedPlannedSettings));
    
    fetchQuote();
  }, []);

  // Save persistence
  useEffect(() => {
    localStorage.setItem("work-tracker-login", loginTime);
    localStorage.setItem("work-tracker-mode", calculationMode);
    localStorage.setItem("work-tracker-hours", requiredHours);
    localStorage.setItem("work-tracker-minutes", requiredMinutes);
    localStorage.setItem("work-tracker-planned-out", plannedOutTime);
    localStorage.setItem("work-tracker-holidays", JSON.stringify(holidays));
    localStorage.setItem("work-tracker-login-settings", JSON.stringify(loginModeSettings));
    localStorage.setItem("work-tracker-planned-settings", JSON.stringify(plannedModeSettings));
  }, [loginTime, calculationMode, requiredHours, requiredMinutes, plannedOutTime, holidays, loginModeSettings, plannedModeSettings]);

  // Clock Tick
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Main Calculation Logic
  useEffect(() => {
    try {
      const istNow = toZonedTime(now, IST_TIMEZONE);
      const istDateString = format(istNow, 'yyyy-MM-dd');
      
      const loginDateTime = parse(`${istDateString} ${loginTime}`, 'yyyy-MM-dd hh:mm aa', new Date());
      const plannedOutDateTime = parse(`${istDateString} ${plannedOutTime}`, 'yyyy-MM-dd hh:mm aa', new Date());

      // Base work hours
      let baseHours = parseInt(requiredHours) || 0;
      let baseMinutes = parseInt(requiredMinutes) || 0;
      
      const { isHalfDay, shortLeaveCount, shortLeaveDuration } = currentSettings;

      // Adjust for half day
      if (isHalfDay) {
        const totalBaseMinutes = (baseHours * 60 + baseMinutes) / 2;
        baseHours = Math.floor(totalBaseMinutes / 60);
        baseMinutes = Math.round(totalBaseMinutes % 60);
      }
      
      // Short Leave deductions
      const shortLeaveDeduction = (parseInt(shortLeaveCount) || 0) * (parseInt(shortLeaveDuration) || 50);
      const totalRequiredMinutes = (baseHours * 60) + baseMinutes - shortLeaveDeduction;
      
      // Calculate Arrival Time based on Planned Out Time
      const arrivalDateTime = subMinutes(plannedOutDateTime, totalRequiredMinutes);
      setRequiredArrivalTime(format(arrivalDateTime, 'hh:mm aa'));

      // Calculate Actual Logout Time based on Login Time
      const logoutDateTime = addMinutes(loginDateTime, totalRequiredMinutes);
      setLogoutTimeStr(format(logoutDateTime, 'hh:mm aa'));

      // Now vs Relevant Boundary
      const nowMinutes = parseInt(formatTz(istNow, 'H', { timeZone: IST_TIMEZONE })) * 60 + parseInt(formatTz(istNow, 'm', { timeZone: IST_TIMEZONE }));
      
      let referenceLoginMinutes;
      let referenceLogoutMinutes;
      let totalMinutesToConsider;

      if (calculationMode === "login") {
        referenceLoginMinutes = parseInt(format(loginDateTime, 'H')) * 60 + parseInt(format(loginDateTime, 'm'));
        referenceLogoutMinutes = referenceLoginMinutes + totalRequiredMinutes;
        totalMinutesToConsider = totalRequiredMinutes;
      } else {
        referenceLoginMinutes = parseInt(format(arrivalDateTime, 'H')) * 60 + parseInt(format(arrivalDateTime, 'm'));
        referenceLogoutMinutes = parseInt(format(plannedOutDateTime, 'H')) * 60 + parseInt(format(plannedOutDateTime, 'm'));
        totalMinutesToConsider = totalRequiredMinutes;
      }

      const diffMinutes = referenceLogoutMinutes - nowMinutes;
      
      if (nowMinutes < referenceLoginMinutes) {
        setIsNotStarted(true);
        setIsOvertime(false);
        const waitMinutes = referenceLoginMinutes - nowMinutes;
        setRemainingTimeStr(`${Math.floor(waitMinutes / 60)}h ${waitMinutes % 60}m`);
        setProgress(0);
      } else {
        setIsNotStarted(false);
        const workedMinutes = nowMinutes - referenceLoginMinutes;
        setProgress(Math.min(100, Math.max(0, (workedMinutes / totalMinutesToConsider) * 100)));

        if (diffMinutes > 0) {
          setIsOvertime(false);
          setRemainingTimeStr(`${Math.floor(diffMinutes / 60)}h ${diffMinutes % 60}m`);
        } else {
          setIsOvertime(true);
          const absDiff = Math.abs(diffMinutes);
          setRemainingTimeStr(`${Math.floor(absDiff / 60)}h ${absDiff % 60}m`);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, [now, loginTime, calculationMode, requiredHours, requiredMinutes, loginModeSettings, plannedModeSettings, plannedOutTime]);

  const handleReset = () => {
    setLoginTime("09:30 AM");
    setCalculationMode("login");
    setRequiredHours("09");
    setRequiredMinutes("00");
    setLoginModeSettings({ isHalfDay: false, shortLeaveCount: "0", shortLeaveDuration: "50" });
    setPlannedModeSettings({ isHalfDay: false, shortLeaveCount: "0", shortLeaveDuration: "50" });
    setPlannedOutTime("06:30 PM");
    setHolidays([]);
    toast({ title: "Reset to defaults" });
  };

  const isHoliday = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const day = date.getDay();
    const isWeekend = day === 0 || day === 6; // Sunday or Saturday
    const manuallySet = holidays.includes(dateStr);
    return isWeekend ? !manuallySet : manuallySet;
  };

  const toggleHoliday = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    setHolidays(prev => 
      prev.includes(dateStr) 
        ? prev.filter(d => d !== dateStr) 
        : [...prev, dateStr]
    );
  };
  const hoursList = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
  const minutesList = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));
  const shortLeaveCounts = ["0", "1", "2", "3"];

  return (
		<div
			className={cn(
				"min-h-screen w-full bg-background text-foreground transition-all duration-700 flex flex-col",
				isNotStarted
					? "selection:bg-primary/30 [--status-color:var(--primary)]"
					: isOvertime
						? "selection:bg-green-500/30 [--status-color:142_70%_50%]"
						: "selection:bg-primary/30 [--status-color:var(--primary)]",
			)}
		>
			{/* Dynamic Theme Background */}
			<div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
				<div
					className={cn(
						"absolute top-0 left-1/4 w-96 h-96 rounded-full blur-[100px] transition-all duration-1000",
						isNotStarted
							? "bg-primary/10"
							: isOvertime
								? "bg-green-500/10"
								: "bg-primary/10",
					)}
				/>
				<div
					className={cn(
						"absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full blur-[100px] transition-all duration-1000",
						isNotStarted
							? "bg-blue-500/10"
							: isOvertime
								? "bg-emerald-500/10"
								: "bg-accent/10",
					)}
				/>
			</div>

			<style
				dangerouslySetInnerHTML={{
					__html: `
        :root {
          --primary: ${isNotStarted ? "221 83% 53%" : isOvertime ? "142 70% 50%" : "221 83% 53%"};
          --ring: ${isNotStarted ? "221 83% 53%" : isOvertime ? "142 70% 50%" : "221 83% 53%"};
        }
        .dark {
          --primary: ${isNotStarted ? "217 91% 60%" : isOvertime ? "142 70% 50%" : "217 91% 60%"};
          --ring: ${isNotStarted ? "224 76% 48%" : isOvertime ? "142 70% 50%" : "224 76% 48%"};
        }
        .dark .border, .dark .bg-card\/30, .dark .bg-card\/20, .dark [class*="border"] {
          border: 1px solid rgba(255, 255, 255, 0.2) !important;
        }
      `,
				}}
			/>

			<main className="relative z-10 flex-1 flex flex-col max-w-full 2xl:max-w-[1600px] mx-auto w-full p-4 gap-4 pb-10 h-full">
				{/* Header */}
				<header className="flex justify-between items-center h-12 shrink-0">
					<div className="flex items-center gap-3">
						<div
							className={cn(
								"p-2 rounded-lg shadow-lg transition-colors duration-500",
								isNotStarted
									? "bg-primary"
									: isOvertime
										? "bg-green-500"
										: "bg-primary",
							)}
						>
							<Hourglass className="w-5 h-5 text-white" />
						</div>
						<div>
							<h1 className="text-xl font-bold tracking-tight">ClockOut</h1>
							<p className="text-[10px] text-muted-foreground uppercase tracking-widest leading-none">
								Because your time matters
							</p>
						</div>
					</div>

					<div className="flex items-center gap-4">
						<div className="text-right hidden sm:block">
							<p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
								{formatTz(now, "EEEE, MMM dd", { timeZone: IST_TIMEZONE })}
							</p>
							<p className="text-lg font-mono font-medium tabular-nums leading-none">
								{formatTz(now, "hh:mm aa", { timeZone: IST_TIMEZONE })}
							</p>
						</div>
						<ThemeToggle />
					</div>
				</header>

				{/* Motivational Quote */}
				<motion.div className="min-h-12 shrink-0 bg-card/20 backdrop-blur-md border border-white/30 rounded-xl flex flex-col items-center justify-center px-4 gap-1">
					<div className="flex items-center gap-2">
						<Quote className="w-3 h-3 text-primary shrink-0" />
						<p className="italic text-xs text-muted-foreground font-medium text-center">
							"{quote.content}"
						</p>
					</div>
					<p className="text-[10px] text-muted-foreground/60">
						— {quote.author}
					</p>
				</motion.div>

				<div className="flex-1 flex flex-col lg:grid lg:grid-cols-12 gap-4 min-h-0">
					{/* Controls Panel */}
					<div className="lg:col-span-4 xl:col-span-3 flex flex-col min-h-0">
						<div className="flex-1 bg-card/30 backdrop-blur-xl border border-white/30 rounded-2xl p-4 flex flex-col gap-4 overflow-y-auto scrollbar-none">
							<h2 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 mb-2">
								<Settings className="w-4 h-4 text-primary" /> Configuration
							</h2>

							<div className="space-y-4">
								<div className="space-y-2">
									<Label className="text-xs font-bold uppercase tracking-tighter">
										Calculation Mode
									</Label>
									<div className="grid grid-cols-2 gap-2">
										<Button
											variant={
												calculationMode === "login" ? "default" : "outline"
											}
											size="sm"
											onClick={() => setCalculationMode("login")}
											className="text-[10px] h-8"
										>
											<Clock className="w-3 h-3 mr-1" /> Login Based
										</Button>
										<Button
											variant={
												calculationMode === "planned" ? "default" : "outline"
											}
											size="sm"
											onClick={() => setCalculationMode("planned")}
											className="text-[10px] h-8"
										>
											<LogOut className="w-3 h-3 mr-1" /> Planned Based
										</Button>
									</div>
								</div>

								<AnimatePresence mode="wait">
									{calculationMode === "login" ? (
										<motion.div
											key="login-input"
											initial={{ opacity: 0, y: 10 }}
											animate={{ opacity: 1, y: 0 }}
											exit={{ opacity: 0, y: -10 }}
										>
											<TimeInput
												label="Login Time"
												value={loginTime}
												onChange={setLoginTime}
											/>
										</motion.div>
									) : (
										<motion.div
											key="planned-input"
											initial={{ opacity: 0, y: 10 }}
											animate={{ opacity: 1, y: 0 }}
											exit={{ opacity: 0, y: -10 }}
										>
											<TimeInput
												label="Planned Out"
												value={plannedOutTime}
												onChange={setPlannedOutTime}
											/>
										</motion.div>
									)}
								</AnimatePresence>

								<div className="space-y-2">
									<Label className="text-xs font-bold uppercase tracking-tighter">
										Required Hours & Mins
									</Label>
									<div className="grid grid-cols-2 gap-2">
										<Select
											value={requiredHours}
											onValueChange={setRequiredHours}
										>
											<SelectTrigger className="h-10 bg-background/50 border-primary/20">
												<SelectValue />
											</SelectTrigger>
											<SelectContent className="max-h-40">
												{hoursList.map((h) => (
													<SelectItem key={h} value={h}>
														{h}h
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<Select
											value={requiredMinutes}
											onValueChange={setRequiredMinutes}
										>
											<SelectTrigger className="h-10 bg-background/50 border-primary/20">
												<SelectValue />
											</SelectTrigger>
											<SelectContent className="max-h-40">
												{minutesList.map((m) => (
													<SelectItem key={m} value={m}>
														{m}m
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>
								</div>

								<div className="flex items-center justify-between p-3 bg-background/40 rounded-xl border border-border/50">
									<div className="space-y-0.5">
										<Label className="text-xs font-bold uppercase tracking-tighter">
											Half Day
										</Label>
										<p className="text-[10px] text-muted-foreground">
											Reduce hours by 50%
										</p>
									</div>
									<Checkbox
										checked={currentSettings.isHalfDay}
										onCheckedChange={(v) => setSettings({ isHalfDay: !!v })}
									/>
								</div>

								<div className="grid grid-cols-2 gap-3">
									<div className="space-y-2">
										<Label className="text-xs font-bold uppercase tracking-tighter">
											Short Leaves
										</Label>
										<Select
											value={currentSettings.shortLeaveCount}
											onValueChange={(v) => setSettings({ shortLeaveCount: v })}
										>
											<SelectTrigger className="h-10 bg-background/50 border-primary/20">
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												{shortLeaveCounts.map((c) => (
													<SelectItem key={c} value={c}>
														{c}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>
									<div className="space-y-2">
										<Label className="text-xs font-bold uppercase tracking-tighter">
											Mins/Leave
										</Label>
										<Select
											value={currentSettings.shortLeaveDuration}
											onValueChange={(v) =>
												setSettings({ shortLeaveDuration: v })
											}
										>
											<SelectTrigger className="h-10 bg-background/50 border-primary/20">
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												{["30", "40", "50", "60"].map((m) => (
													<SelectItem key={m} value={m}>
														{m}m
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>
								</div>
							</div>

							<div className="mt-auto pt-4 border-t border-border/50">
								<Button
									variant="ghost"
									size="sm"
									className="w-full text-[10px] h-8"
									onClick={handleReset}
								>
									<RotateCcw className="w-3 h-3 mr-2" /> Reset Defaults
								</Button>
							</div>
						</div>
					</div>

					{/* Display Panel */}
					<div className="lg:col-span-8 xl:col-span-9 flex flex-col gap-4 overflow-hidden">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-3 shrink-0">
							{calculationMode === "planned" && (
								<StatCard
									title="Arrival"
									value={requiredArrivalTime}
									subtext="Required"
									variant="default"
									className="p-4 border-2"
								/>
							)}
							{calculationMode === "login" && (
								<StatCard
									title="Logout"
									value={logoutTimeStr}
									subtext="Calculated"
									variant="default"
									className="p-4 border-white/30"
								/>
							)}
							<StatCard
								title={
									isOvertime
										? "Overtime"
										: isNotStarted
											? "Starts In"
											: "Remaining"
								}
								value={remainingTimeStr}
								variant={isOvertime ? "success" : "primary"}
								className="p-4 border-2"
							/>
						</div>

						<div
							className={cn(
								"flex-1 border-2 rounded-2xl p-6 flex flex-col b-2 justify-center relative overflow-hidden transition-colors duration-700 min-h-[300px]",
								isNotStarted
									? "bg-primary/5 border-primary/20"
									: isOvertime
										? "bg-green-500/10 border-green-500/20"
										: "bg-card/40 border-border/50",
							)}
						>
							<div className="relative z-10 text-center lg:text-left">
								<div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
									<div
										className={cn(
											"w-2 h-2 rounded-full animate-ping",
											isNotStarted
												? "bg-primary"
												: isOvertime
													? "bg-green-500"
													: "bg-primary",
										)}
									/>
									<span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
										Live Tracker
									</span>
								</div>

								<h3
									className={cn(
										"text-3xl sm:text-4xl lg:text-5xl font-bold mb-4",
										isNotStarted
											? "text-primary"
											: isOvertime
												? "text-green-500"
												: "text-foreground",
									)}
								>
									{isNotStarted
										? "Preparing for shift"
										: isOvertime
											? "Great overtime work!"
											: "Currently in session"}
								</h3>

								<p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto lg:mx-0">
									{isNotStarted
										? `Take a breath! You have ${remainingTimeStr} before work begins.`
										: isOvertime
											? `You've exceeded required hours by ${remainingTimeStr}. Take a well-deserved break!`
											: `Stay focused! You're ${Math.round(progress)}% through your required shift today.`}
								</p>
							</div>

							<div className="mt-12 max-w-4xl w-full mx-auto lg:mx-0">
								<div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
									<span>Start</span>
									<span className="text-primary">
										{Math.round(progress)}% Complete
									</span>
									<span>Goal</span>
								</div>
								<div className="h-4 bg-background/50 rounded-full overflow-hidden border border-white/5 relative">
									<motion.div
										className={cn(
											"h-full transition-all duration-1000",
											isOvertime
												? "bg-green-500 shadow-[0_0_20px_rgba(34,197,94,0.3)]"
												: "bg-primary shadow-[0_0_20px_rgba(var(--primary),0.3)]",
										)}
										initial={{ width: 0 }}
										animate={{ width: `${progress}%` }}
										transition={{ duration: 1.5 }}
									/>
								</div>
							</div>
						</div>

						<footer
							className="min-h-24 shrink-0 bg-card/30 backdrop-blur-xl border border-white/30 rounded-2xl p-4 flex flex-col gap-3 cursor-pointer hover:bg-card/40 transition-colors"
							onClick={() => setIsCalendarOpen(true)}
						>
							<div className="flex items-center justify-between px-1">
								<h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
									<CalendarIcon className="w-3 h-3" /> Weekly Progress
								</h4>
								<div className="flex items-center gap-3">
									<span className="text-[8px] text-muted-foreground uppercase flex items-center gap-1">
										<div className="w-2 h-2 rounded-full bg-sky-400" /> Holiday
									</span>
									<span className="text-[8px] text-muted-foreground uppercase">
										Week starts Monday
									</span>
								</div>
							</div>
							<div className="grid grid-cols-7 gap-2 flex-1">
								{(() => {
									const startOfCurrentWeek = startOfWeek(
										toZonedTime(now, IST_TIMEZONE),
										{ weekStartsOn: 1 },
									);
									const today = toZonedTime(now, IST_TIMEZONE);

									return Array.from({ length: 7 }).map((_, i) => {
										const day = addDays(startOfCurrentWeek, i);
										const isDayToday = isSameDay(day, today);
										const isPast = day < today && !isDayToday;
										const isUpcoming = day > today;
										const isDayHoliday = isHoliday(day);

										return (
											<div
												key={i}
												className="flex flex-col items-center justify-center gap-2 cursor-pointer"
												onClick={(e) => {
													e.stopPropagation();
													toggleHoliday(day);
												}}
												onContextMenu={(e) => {
													e.preventDefault();
													e.stopPropagation();
													toggleHoliday(day);
												}}
											>
												<span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
													{format(day, "EEE")}
												</span>
												<div
													className={cn(
														"w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 border-2",
														isDayHoliday
															? "bg-sky-400 text-white border-sky-300 shadow-[0_0_15px_rgba(56,189,248,0.4)]"
															: isDayToday
																? "bg-red-500 text-white border-red-400 shadow-[0_0_15px_rgba(239,68,68,0.4)] scale-110"
																: isPast
																	? "bg-green-500 text-white border-green-400"
																	: isUpcoming
																		? "bg-blue-500/10 text-blue-500 border-blue-500/20"
																		: "bg-muted/20 text-muted border-transparent",
													)}
												>
													{format(day, "dd")}
												</div>
											</div>
										);
									});
								})()}
							</div>
						</footer>

						<Dialog open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
							<DialogContent className="max-w-md bg-background/95 backdrop-blur-xl border-border/50">
								<DialogHeader>
									<DialogTitle className="flex items-center justify-between">
										<div className="flex items-center gap-2">
											<CalendarIcon className="w-5 h-5 text-primary" />
											<span>Monthly Overview</span>
										</div>
										<div className="flex items-center gap-1">
											<Button
												variant="ghost"
												size="icon"
												onClick={() =>
													setCalendarDate(subMonths(calendarDate, 1))
												}
											>
												<ChevronLeft className="w-4 h-4" />
											</Button>
											<span className="text-sm font-bold min-w-[100px] text-center">
												{format(calendarDate, "MMMM yyyy")}
											</span>
											<Button
												variant="ghost"
												size="icon"
												onClick={() =>
													setCalendarDate(addMonths(calendarDate, 1))
												}
											>
												<ChevronRight className="w-4 h-4" />
											</Button>
										</div>
									</DialogTitle>
								</DialogHeader>
								<div className="p-4">
									<div className="grid grid-cols-7 gap-1 mb-2">
										{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
											(d) => (
												<div
													key={d}
													className="text-[10px] font-bold text-muted-foreground text-center uppercase"
												>
													{d}
												</div>
											),
										)}
									</div>
									<div className="grid grid-cols-7 gap-1">
										{(() => {
											const start = startOfWeek(startOfMonth(calendarDate), {
												weekStartsOn: 1,
											});
											const end = endOfMonth(calendarDate);
											const days = eachDayOfInterval({
												start,
												end: addDays(end, (7 - end.getDay()) % 7),
											});
											const today = toZonedTime(now, IST_TIMEZONE);

											return days.map((day, i) => {
												const isCurrentMonth =
													getMonth(day) === getMonth(calendarDate);
												const isDayToday = isSameDay(day, today);
												const isPast = day < today && !isDayToday;
												const isUpcoming = day > today;
												const isDayHoliday = isHoliday(day);

												return (
													<div
														key={i}
														onClick={(e) => {
															e.stopPropagation();
															toggleHoliday(day);
														}}
														onContextMenu={(e) => {
															e.preventDefault();
															e.stopPropagation();
															toggleHoliday(day);
														}}
														className={cn(
															"h-10 rounded-lg flex items-center justify-center text-xs font-medium transition-all duration-300 border cursor-pointer",
															!isCurrentMonth
																? "opacity-20 border-transparent"
																: isDayHoliday
																	? "bg-sky-400 text-white border-sky-300 shadow-lg scale-105 z-10"
																	: isDayToday
																		? "bg-red-500 text-white border-red-400 shadow-lg scale-110 z-10"
																		: isPast
																			? "bg-green-500/10 text-green-500 border-green-500/20"
																			: isUpcoming
																				? "bg-blue-500/5 text-blue-500/50 border-blue-500/10"
																				: "bg-muted/30 text-muted-foreground border-transparent",
														)}
													>
														{format(day, "d")}
													</div>
												);
											});
										})()}
									</div>
								</div>
							</DialogContent>
						</Dialog>
					</div>
				</div>
			</main>
		</div>
	);
}
