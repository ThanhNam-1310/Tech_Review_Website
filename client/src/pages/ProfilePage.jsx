import Profile from "@/components/profile/Profile";
import { useAuth } from "@/contexts/AuthContext";

const ProfilePage = () => {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <Profile user={user} />
    </div>
  );
};

export default ProfilePage;
