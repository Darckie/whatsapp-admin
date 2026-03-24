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
    <>
      <button className="bg-red-100 rounded-md flex w-[100px] h-[30px] items-center justify-center" onClick={onclose}>
        <BsArrowBarLeft className="text-red-500" />
      </button>


      <Banner />

    </>
  );
};

export default ProfileOverview;
