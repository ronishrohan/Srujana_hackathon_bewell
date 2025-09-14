import { EyeOpenIcon, PlusCircledIcon } from "@radix-ui/react-icons";
import { Button, Skeleton } from "@radix-ui/themes";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "../../firebase";
import { onAuthStateChanged } from "firebase/auth";

const Plans = () => {
    const navigate = useNavigate();
    const [plans, setPlans] = useState([]);
    const [plansLoading, setPlansLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (!currentUser) {
                navigate("/login");
            } else {
                // Fetch plans where current user is the viewer or createdBy
                const fetchPlans = async () => {
                    setPlansLoading(true);
                    const plansArr = [];
                    // Fetch viewer plans
                    const viewerQuery = query(
                        collection(db, "plans"),
                        where("viewer", "==", currentUser.uid)
                    );
                    const viewerSnapshot = await getDocs(viewerQuery);
                    viewerSnapshot.forEach((doc) => {
                        plansArr.push({ id: doc.id, ...doc.data(), _isViewer: true });
                    });
                    // Fetch createdBy plans
                    const createdByQuery = query(
                        collection(db, "plans"),
                        where("createdBy", "==", currentUser.uid)
                    );
                    const createdBySnapshot = await getDocs(createdByQuery);
                    createdBySnapshot.forEach((doc) => {
                        // Avoid duplicates if already in viewer plans
                        if (!plansArr.some((p) => p.id === doc.id)) {
                            plansArr.push({ id: doc.id, ...doc.data(), _isViewer: false });
                        }
                    });
                    setPlans(plansArr);
                    setPlansLoading(false);
                };
                fetchPlans();
            }
        });
        return () => unsubscribe();
    }, [navigate]);

    return (
        <div className="p-2 w-full">
            <div className=" text-3xl mb-4 font-[Cal_Sans]">Plans</div>
            <div className="grid grid-cols-5 w-full gap-2">
                <Button
                    variant="outline"
                    onClick={() => navigate("/create")}
                    color="green"
                    className="!h-[20vh] !p-4 !text-xl !font-[Cal_Sans]"
                >
                    <PlusCircledIcon width={20} height={20} />
                    Create plan
                </Button>
                {plansLoading ? (
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
                    plans.map((plan) => <PlanCard key={plan.id} plan={plan} />)
                )}
            </div>
        </div>
    );
};

const PlanCard = ({ plan }) => {
    const checklist = Array.isArray(plan.checklistDone) ? plan.checklistDone : [];
    const total = checklist.length;
    const done = checklist.filter(Boolean).length;
    const percent = total > 0 ? Math.round((done / total) * 100) : 0;

    const isDone = percent === 100;
    const buttonColor = isDone ? "green" : "ruby";
    const progressBg = isDone ? "bg-green-3" : "bg-ruby-3";
    const progressBar = isDone ? "bg-green-9" : "bg-ruby-9";

    const navigate = useNavigate();
    return (
        <Button
            onClick={() => navigate(`/plan/${plan.id}`)}
            variant="outline"
            color={buttonColor}
            className="!h-[20vh] w-full !p-4 !flex !flex-col !items-start !gap-0 !justify-start "
        >
            <div className="text-xl font-[Cal_Sans]">{plan.name}</div>
            <div className="text-base">{plan.type}</div>
           
            <div
                className={`w-full h-[5vh] mt-auto rounded-sm relative flex items-center justify-start ${progressBg}`}
            >
                
                <div
                    className={`h-full rounded-sm ${progressBar}`}
                    style={{ width: `${percent}%` }}
                ></div>
            </div>
             <div className="flex w-full justify-end">
                {plan._isViewer && (
                <div className="text-xs flex gap-2 items-center"><EyeOpenIcon /> VIEWER</div>
            )}
            <div className="w-full text-right font-[Cal_Sans]">{percent}%</div>
             </div>
        </Button>
    );
};

export default Plans;
