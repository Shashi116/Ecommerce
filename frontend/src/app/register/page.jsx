import Register from '../../views/Register';
import fetchOAuthLogin from "@/services/auth";

export default function Page() {
   const handleAuthLogin = fetchOAuthLogin;
  return <Register onOAuth={handleAuthLogin} />;
}
