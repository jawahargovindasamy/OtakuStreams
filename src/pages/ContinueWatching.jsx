import ContinueWatchingCard from '@/components/ContinueWatchingCard';
import Navbar from '@/components/Navbar';
import SecondaryNavbar from '@/components/SecondaryNavbar';
import SectionHeader from '@/components/SectionHeader';
import { useAuth } from '@/context/auth-provider';
import React, { useState } from 'react';
import { Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

const ContinueWatching = () => {
    const { continueWatching, setContinueWatching, api } = useAuth();
    const [isClearing, setIsClearing] = useState(false);
    const [open, setOpen] = useState(false);

    const handleClearAll = async () => {
        setIsClearing(true);
        
        try {
            await api.delete("/continue-watching");
            
            // Clear local state immediately for better UX
            setContinueWatching([]);
            setOpen(false);
            toast.success("Watch history cleared", {
                description: "All items have been removed from your continue watching list.",
            });
        } catch (error) {
            toast.error("Failed to clear history", {
                description: error.response?.data?.message || "Something went wrong. Please try again.",
            });
        } finally {
            setIsClearing(false);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <SecondaryNavbar />
            
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-6 sm:py-8 lg:py-10">
                <section className="space-y-4 sm:space-y-5 w-full">
                    <div className="flex items-center justify-between">
                        <SectionHeader
                            title="Continue Watching"
                            className="text-foreground tracking-tight"
                        />
                        
                        {continueWatching.length > 0 && (
                            <AlertDialog open={open} onOpenChange={setOpen}>
                                <AlertDialogTrigger asChild>
                                    <Button 
                                        variant="outline" 
                                        size="sm"
                                        className="group flex items-center gap-2 text-destructive border-destructive/20 hover:text-destructive-foreground hover:border-destructive"
                                    >
                                        <Trash2 className="w-4 h-4 transition-transform group-hover:scale-110" />
                                        <span className="hidden sm:inline">Clear All</span>
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="sm:max-w-md">
                                    <AlertDialogHeader className="space-y-3">
                                        <div className="mx-auto w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-destructive/10 flex items-center justify-center mb-2">
                                            <AlertTriangle className="w-6 h-6 sm:w-7 sm:h-7 text-destructive" />
                                        </div>
                                        <AlertDialogTitle className="text-center text-lg sm:text-xl">
                                            Clear All History?
                                        </AlertDialogTitle>
                                        <AlertDialogDescription className="text-center text-sm text-muted-foreground">
                                            This will permanently remove all {continueWatching.length} items from your continue watching list. This action cannot be undone.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter className="sm:justify-center gap-3 mt-4">
                                        <AlertDialogCancel 
                                            disabled={isClearing}
                                            className="mt-0 sm:w-24"
                                        >
                                            Cancel
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={handleClearAll}
                                            disabled={isClearing}
                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 sm:w-24"
                                        >
                                            {isClearing ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                'Clear All'
                                            )}
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )}
                    </div>
                </section>

                {continueWatching.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-6 w-full mt-6">
                        {continueWatching.map((item) => (
                            <ContinueWatchingCard 
                                key={item._id} 
                                item={item} 
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 sm:py-32 text-center">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                            <svg 
                                className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground/60" 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                            >
                                <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth={1.5} 
                                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" 
                                />
                                <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth={1.5} 
                                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                                />
                            </svg>
                        </div>
                        <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">
                            No Continue Watching
                        </h3>
                        <p className="text-sm sm:text-base text-muted-foreground max-w-md">
                            Start watching some anime and they'll appear here for easy access.
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default ContinueWatching;