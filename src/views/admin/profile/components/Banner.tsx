import { useEffect, useState } from "react";
import avatar from "assets/img/avatars/avatar11.png";
import banner from "assets/img/profile/banner.png";
import Card from "components/card";
import { useAuth } from "../../../../context/AuthContext";
import { MdVerifiedUser, MdEmail, MdPhone } from "react-icons/md";

const Banner = () => {
  const { user } = useAuth();
  const [initials, setInitials] = useState("GU");

  // Generate initials from full name
  useEffect(() => {
    if (user?.full_name) {
      const names = user.full_name.split(" ");
      const init = names.map((n) => n.charAt(0).toUpperCase()).join("");
      setInitials(init.slice(0, 2));
    }
  }, [user?.full_name]);

  return (
    <div>


      {/* Background and profile */}
      <div
        className="relative mt-1 flex h-32 w-full justify-center rounded-xl bg-cover"
        style={{ backgroundImage: `url(${banner})` }}
      >
        <div className="absolute -bottom-12 flex h-[87px] w-[87px] items-center justify-center rounded-full border-[4px] border-white bg-gradient-to-br from-blue-400 to-indigo-600 dark:!border-navy-700 shadow-lg">
          <span className="text-2xl font-bold text-white">{initials}</span>
        </div>
      </div>

      {/* Name and position */}
      <div className="mt-16 flex flex-col items-center">
        <div className="flex items-center gap-2">
          <h4 className="text-xl font-bold text-navy-700 dark:text-white">
            {user?.full_name || "Guest User"}
          </h4>
          {user?.email_verified && (
            <MdVerifiedUser className="h-5 w-5 text-green-500" title="Email Verified" />
          )}
        </div>
        <p className="text-base font-normal text-gray-600 dark:text-gray-300">
          {user?.roles?.[0] || "User"}
        </p>
      </div>

      {/* Contact Information */}
      <div className="mt-6 mb-3 w-full px-4 py-4 bg-gray-50 dark:bg-navy-800 rounded-lg border border-gray-200 dark:border-navy-700">
        <div className="space-y-3">
          {/* Email */}
          <div className="flex items-center gap-3">
            <MdEmail className="h-5 w-5 text-blue-500 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">
                {user?.email || "No Email"}
              </p>
            </div>
          </div>

          {/* Phone */}
          {user?.phone && (
            <div className="flex items-center gap-3">
              <MdPhone className="h-5 w-5 text-green-500 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 dark:text-gray-400">Phone</p>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  {user.phone}
                </p>
              </div>
            </div>
          )}

          {/* Account ID */}
          {user?.account_id && (
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 text-purple-500 flex-shrink-0 font-bold">#</div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 dark:text-gray-400">Account ID</p>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">
                  {user.account_id}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default Banner;
