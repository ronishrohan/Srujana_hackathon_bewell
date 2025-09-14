import { PlusCircledIcon } from "@radix-ui/react-icons";
import { Button, Spinner, Skeleton, Tooltip } from "@radix-ui/themes";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../firebase";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";

const Session = () => {
    const navigate = useNavigate();
    const [sessions, setSessions] = useState([]);
    const [sessionsLoading, setSessionsLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                const fetchSessions = async () => {
                    setSessionsLoading(true);
                    const sessionsQuery = query(
                        collection(db, "sessions"),
                        where("createdBy", "==", currentUser.uid)
                    );
                    const querySnapshot = await getDocs(sessionsQuery);
                    const sessionsArr = [];
                    querySnapshot.forEach((doc) => {
                        sessionsArr.push({ id: doc.id, ...doc.data() });
                    });
                    setSessions(sessionsArr);
                    setSessionsLoading(false);
                };
                fetchSessions();
            }
        });
        return () => unsubscribe();
    }, []);

    return (
        <div className="p-2 w-full">
            <div>
                <div className="text-3xl mb-4 font-[Cal_Sans]">Sessions</div>
                <div className="grid grid-cols-5 gap-2">
                    <Button
                        variant="outline"
                        onClick={() => navigate("/start")}
                        color="ruby"
                        className="!h-[20vh] !p-4 !text-xl !font-[Cal_Sans]"
                    >
                        <PlusCircledIcon width={20} height={20} />
                        Create Session
                    </Button>
                    {sessionsLoading ? (
                        // Show 4 skeletons as placeholders
                        <>
                            {[...Array(4)].map((_, i) => (
                                <Skeleton
                                    key={i}
                                    className="!h-[20vh] !p-4 !rounded-md"
                                    style={{ width: "100%" }}
                                />
                            ))}
                        </>
                    ) : (
                        sessions.map((session) => <SessionCard key={session.id} session={session} />)
                    )}
                </div>
            </div>
        </div>
    );
};

const SessionCard = ({ session }) => {
    const total = Array.isArray(session.data) ? session.data.length : 0;
    const locked = Array.isArray(session.lockedSteps) ? session.lockedSteps.length : 0;
    const percent = total > 0 ? Math.round(((total - locked) / total) * 100) : 0;

    const isDone = percent === 100;
    const buttonColor = isDone ? "green" : "ruby";
    const progressBg = session.locked === true
        ? "bg-blue-3"
        : isDone
        ? "bg-green-3"
        : "bg-ruby-3";
    const progressBar = session.locked === true
        ? "bg-blue-9"
        : isDone
        ? "bg-green-9"
        : "bg-ruby-9";

    const [showLockedDialog, setShowLockedDialog] = React.useState(false);
    const navigate = useNavigate();

    const handleClick = () => {
        if (session.locked === true) {
            setShowLockedDialog(true);
        } else {
            navigate(`/session/${session.id}`);
        }
    };

    return (
        <>
            <Button
                variant="outline"
                color={session.locked === true ? "blue" : buttonColor}
                className={`!h-[20vh] !p-4 !flex !flex-col !items-start !gap-0 !justify-start ${session.locked === true ? "!border-blue-7 !bg-blue-2" : ""}`}
                asChild
                tabIndex={-1}
                style={{ pointerEvents: "none" }}
            >
                <div>
                    <div className="text-xl font-[Cal_Sans]">{session.name}</div>
                    <div className="text-base">{session.type}</div>
                    <div
                        className={`w-full h-[5vh] mt-auto rounded-sm relative flex items-center justify-start ${progressBg}`}
                    >
                        <div
                            className={`h-full rounded-sm ${progressBar}`}
                            style={{ width: `${percent}%` }}
                        ></div>
                    </div>
                    <div className="w-full text-right font-[Cal_Sans]">{percent}%</div>
                    {/* Show creation date below progress bar, no label */}
                    <div className="w-full text-xs text-gray-500 mt-1 text-right">
                        {
                            session.createdAt
                                ? (() => {
                                    let dateObj;
                                    if (session.createdAt.seconds) {
                                        dateObj = new Date(session.createdAt.seconds * 1000);
                                    } else {
                                        dateObj = new Date(session.createdAt);
                                    }
                                    return dateObj.toLocaleDateString();
                                })()
                                : ""
                        }
                    </div>
                </div>
            </Button>
            {showLockedDialog && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col gap-4 min-w-[300px]">
                        <div className="text-lg font-bold text-blue-700">Session is already over</div>
                        <div className="text-gray-600">You cannot access this session anymore.</div>
                        <div className="flex gap-2 justify-end">
                            <Button color="blue" variant="soft" onClick={() => setShowLockedDialog(false)}>
                                OK
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Session;
