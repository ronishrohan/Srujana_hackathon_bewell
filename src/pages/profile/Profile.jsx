import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import { Avatar, Tooltip, Separator, Skeleton } from "@radix-ui/themes";

const Profile = () => {
    const { userId } = useParams();
    const [user, setUser] = useState(null);
    const [plansCount, setPlansCount] = useState(0);
    const [sessionsCount, setSessionsCount] = useState(0); // Add state for sessions count
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            setLoading(true);
            const userDoc = await getDoc(doc(db, "users", userId));
            if (userDoc.exists()) {
                setUser(userDoc.data());
            }

            const plansQuery = query(
                collection(db, "plans"),
                where("createdBy", "==", userId)
            );
            const plansSnapshot = await getDocs(plansQuery);
            setPlansCount(plansSnapshot.size);

            // Fetch sessions count
            const sessionsQuery = query(
                collection(db, "sessions"),
                where("createdBy", "==", userId)
            );
            const sessionsSnapshot = await getDocs(sessionsQuery);
            setSessionsCount(sessionsSnapshot.size);

            setLoading(false);
        };

        fetchUserData();
    }, [userId]);

    if (loading) {
        return (
            <div className="p-2 size-full">
                <div className="font-[Cal_Sans] text-3xl mb-6">
                    <Skeleton className="!h-10 w-40 rounded" />
                </div>
                <div className="flex items-center gap-4 mb-6">
                    <Skeleton  className="!w-28 !h-28 !rounded-full" />
                    <div className="flex flex-col gap-2">
                        <Skeleton className="h-10 w-56 rounded mb-2" />
                        <Skeleton className="h-6 w-40 rounded" />
                    </div>
                    <Separator size="3" orientation="vertical" className="h-32 mx-4" />
                    <div className="flex flex-row items-center gap-6">
                        <div className="text-left flex flex-col items-start">
                            <Skeleton className="h-[100px] w-20 rounded mb-2" />
                            <Skeleton className="h-6 w-24 rounded" />
                        </div>
                        <Separator size="3" orientation="vertical" className="h-12 mx-4" />
                        <div className="text-left flex flex-col items-start">
                            <Skeleton className="h-[100px] w-20 rounded mb-2" />
                            <Skeleton className="h-6 w-32 rounded" />
                        </div>
                        <Separator size="3" orientation="vertical" className="h-12 mx-4" />
                        <div className="text-left flex flex-col items-start">
                            <Skeleton className="h-[100px] w-20 rounded mb-2" />
                            <Skeleton className="h-6 w-28 rounded" />
                        </div>
                    </div>
                </div>
                <div>
                    <div className="text-gray-400 font-bold mb-2">Progress</div>
                    <Skeleton className="w-full !h-24 rounded" />
                </div>
            </div>
        );
    }

    return (
        <div className="p-2 size-full">
            <div className="font-[Cal_Sans] text-3xl mb-6" >Profile</div>
            {user && (
                <>
                    <div className="flex items-center gap-4 mb-6">
                        <Avatar
                            radius="full"
                            size={"7"}
                            fallback={user.firstName.charAt(0) + "" + user.lastName.charAt(0)}
                            alt="Profile Avatar"
                            className="w-32 h-32 rounded-full object-cover"
                        />
                        <div className="flex flex-col">
                            <h1 className="text-3xl font-bold">{user.firstName} {user.lastName}</h1>
                            <p className="text-gray-500">{user.email}</p>
                        </div>
                        <Separator size="3" orientation="vertical" className="h-32 mx-4" />
                        <div className="flex flex-row items-center gap-6">
                            <div className="text-left">
                                <h2 className="text-xl font-bold">{plansCount}</h2>
                                <p className="text-gray-500">Plans Created</p>
                            </div>
                            <Separator size="3" orientation="vertical" className="h-12 mx-4" />
                            <div className="text-left">
                                <h2 className="text-xl font-bold">{sessionsCount}</h2>
                                <p className="text-gray-500">Sessions Created</p>
                            </div>
                            <Separator size="3" orientation="vertical" className="h-12 mx-4" />
                            <div className="text-left">
                                <h2 className="text-xl font-bold">{user.score ?? 0}</h2>
                                <p className="text-gray-500">Total Score</p>
                            </div>
                        </div>
                    </div>
                    <div>
                        <div className="text-gray-400 font-bold mb-2">Progress</div>
                        <div className="border-gray-200 border-2 rounded-md p-2 flex flex-wrap gap-1">
                            {(() => {
                                const contributions = user.contributions || [];
                                const nonZero = contributions.filter((w) => w > 0);
                                const avg =
                                    nonZero.length > 0
                                        ? nonZero.reduce((a, b) => a + b, 0) / nonZero.length
                                        : 0;
                                const year = new Date().getFullYear();
                                return contributions.map((weight, i) => {
                                    let color = "bg-gray-200";
                                    if (weight === 0) color = "bg-gray-200";
                                    else if (weight < avg * 0.5) color = "bg-ruby-5";
                                    else if (weight < avg) color = "bg-ruby-7";
                                    else if (weight < avg * 1.5) color = "bg-ruby-10";
                                    else color = "bg-ruby-9";

                                    const date = new Date(year, 0, i + 1);
                                    const dateStr = date.toLocaleDateString(undefined, {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                    });

                                    return weight === 0 ? (
                                        <div key={i} className={`size-4 rounded-sm ${color}`}></div>
                                    ) : (
                                        <Tooltip key={i} content={`${weight} points, ${dateStr}`}>
                                            <div className={`size-4 rounded-sm ${color}`}></div>
                                        </Tooltip>
                                    );
                                });
                            })()}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Profile;
