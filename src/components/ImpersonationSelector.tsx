"use client";

import { type FC, useState } from "react";
import { useSession } from "next-auth/react";
import { api } from "@/trpc/react";
import { Users, UserMinus, ShieldAlert, Loader2, ChevronDown } from "lucide-react";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

export const ImpersonationSelector: FC = () => {
	const { data: session, update } = useSession();
	const [open, setOpen] = useState(false);

	const { data: users, isLoading } = api.admin.listUsers.useQuery(undefined, {
		enabled: !!session?.user?.isAdmin && open,
	});

	const impersonateMutation = api.admin.impersonate.useMutation({
		onSuccess: () => {
			window.location.reload();
		},
	});

	const stopImpersonatingMutation = api.admin.stopImpersonating.useMutation({
		onSuccess: () => {
			window.location.reload();
		},
	});

	if (!session?.user) return null;

	if (session.user.isImpersonating) {
		return (
			<Button
				variant="ghost"
				size="sm"
				className="flex items-center gap-2 text-yellow-500 hover:text-yellow-400 hover:bg-yellow-500/10"
				onClick={() => stopImpersonatingMutation.mutate()}
				disabled={stopImpersonatingMutation.isLoading}
			>
				{stopImpersonatingMutation.isLoading ? (
					<Loader2 className="w-4 h-4 animate-spin" />
				) : (
					<UserMinus className="w-4 h-4" />
				)}
				<span className="hidden sm:inline">Stop Impersonating</span>
				<span className="text-xs opacity-50">({session.user.realUser?.name})</span>
			</Button>
		);
	}

	if (!session.user.isAdmin) return null;

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="ghost"
					size="sm"
					className="flex items-center gap-2 text-blue-500 hover:text-blue-400 hover:bg-blue-500/10"
				>
					<Users className="w-4 h-4" />
					<span className="hidden sm:inline">Impersonate</span>
					<ChevronDown className="w-3 h-3 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-64 p-0 bg-gray-900 border-gray-800 shadow-xl" align="end">
				<div className="p-3 border-b border-gray-800 bg-gray-900/50">
					<h4 className="flex items-center gap-2 font-semibold text-white text-sm">
						<ShieldAlert className="w-4 h-4 text-blue-500" />
						Admin Impersonation
					</h4>
				</div>
				<ScrollArea className="h-[300px]">
					{isLoading ? (
						<div className="flex items-center justify-center py-10 text-gray-500">
							<Loader2 className="w-5 h-5 animate-spin mr-2" />
							<span className="text-sm">Fetching users...</span>
						</div>
					) : users?.length === 0 ? (
						<div className="p-4 text-center text-gray-500 text-sm">
							No users found.
						</div>
					) : (
						<div className="py-2">
							{users?.filter(u => u.id !== session.user.id).map((user) => (
								<button
									key={user.id}
									onClick={() => impersonateMutation.mutate({ userId: user.id })}
									disabled={impersonateMutation.isLoading}
									className="w-full flex items-center gap-3 px-4 py-2 text-left transition hover:bg-white/5 disabled:opacity-50"
								>
									<Avatar className="h-8 w-8 shrink-0">
										<AvatarImage src={user.image ?? undefined} />
										<AvatarFallback className="bg-gray-800 text-xs text-gray-400">
											{user.name?.charAt(0) ?? "?"}
										</AvatarFallback>
									</Avatar>
									<div className="min-w-0">
										<p className="text-sm font-medium text-white truncate">
											{user.name}
										</p>
										<p className="text-[10px] text-gray-500 truncate">
											{user.email}
										</p>
									</div>
								</button>
							))}
						</div>
					)}
				</ScrollArea>
			</PopoverContent>
		</Popover>
	);
};

export default ImpersonationSelector;
