import { IoClose } from "react-icons/io5";
import Banner from "./components/Banner";
import General from "./components/General";
import Notification from "./components/Notification";
import Project from "./components/Project";
import Storage from "./components/Storage";
import Upload from "./components/Upload";

import React from "react";
import { BsArrowBarLeft, BsBack } from "react-icons/bs";
import { useAuth } from "../../../context/AuthContext";

const ProfileOverview = ({ onclose }: { onclose: () => void }) => {
  const { user } = useAuth();
  return (
    <div className="flex w-full flex-col gap-5">
      {/* {user && (
        <div className="rounded-md bg-white p-3 shadow dark:bg-navy-700">
          <p className="text-lg font-bold text-navy-700 dark:text-white">{user.full_name}</p>
          <p className="text-sm text-gray-600 dark:text-white">{user.email}</p>
        </div>
      )} */}

      <button className="bg-red-100 rounded-md flex w-[100px] h-[30px] items-center justify-center" onClick={onclose}>
         <BsArrowBarLeft className="text-red-500" />
      </button>
      <div className="w-ful mt-3 flex h-fit flex-col gap-5 lg:grid lg:grid-cols-3">
        <div className="col-span-2 lg:!mb-0">
          <Banner />
        </div>

        <div className="col-span-1 lg:!mb-0">
          <Notification />
        </div>

        {/* <div className="z-0 col-span-5 lg:!mb-0">
          <Upload />
        </div> */}
      </div>
      {/* all project & ... */}


    </div>
  );
};

export default ProfileOverview;
