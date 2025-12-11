import  { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { authLogout } from "../redux/authSlice";
import { logout } from "../services/authService";
import colors from "../theme/colors";
import ProfileMenu from "../components/ProfileMenu";
import usePageTitle from "../hooks/usePageTitle";
import { useNavigate } from "react-router-dom";


// const tabs = ["Videos", "Books", "Read"];

export default function Home() {
  // const [tab, setTab] = useState(tabs[0]);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  usePageTitle("Home");


  
const user = useSelector((state: any) => state.auth.user);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      logout();
      localStorage.removeItem("token");
      dispatch(authLogout());
      navigate("/login", { replace: true });
    }
  };


  // console.log("login user",user)
  const firstLetter = user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase();

  return (
    <div style={{ minHeight: "100vh", padding: 20, background: colors.mainBg }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
          position: "relative",
        }}
      >
        <div style={{ color: colors.textLight, fontSize: 34,fontWeight:"bolder" }}>JesusPOD</div>

        {/* TABS + PROFILE */}
        <div style={{ display: "flex", gap: 12, alignItems: "center", position: "relative" }}>
          {/* {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                background: t === tab ? colors.red : "transparent",
                color: colors.textLight,
                padding: "8px 12px",
                borderRadius: 8,
              }}
            >
              {t}
            </button>
          ))} */}

          {/* PROFILE CIRCLE */}
          <div
            onClick={() => setMenuOpen((prev) => !prev)}
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: colors.red,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              color: "#fff",
              fontWeight: "bold",
              fontSize: 18,
              cursor: "pointer",
              userSelect: "none",
            }}
          >
            {firstLetter}
          </div>

          {/* POPUP MENU */}
          {menuOpen && (
            <ProfileMenu
              user={user}
              onLogout={handleLogout}
              // onClose={() => setMenuOpen(false)}
            />
          )}
        </div>
      </header>

      <main>
        <h2 style={{ color: colors.textLight, marginBottom: 12,textAlign:"center",justifyContent:"center",alignItems:"center" }}>Working..</h2>
{/* 
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 12,
          }}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              style={{
                background: colors.cardBg,
                border: `1px solid ${colors.red}`,
                borderRadius: 10,
                padding: 12,
              }}
            >
              <div
                style={{
                  height: 120,
                  background: "#111",
                  borderRadius: 8,
                  marginBottom: 8,
                }}
              />

              <div style={{ color: colors.textLight, fontWeight: 600 }}>
                Sample {tab} #{i + 1}
              </div>

              <div className="small-muted" style={{ marginTop: 6 }}>
                Short description or metadata here.
              </div>
            </div>
          ))}
        </div> */}
      </main> 
    </div>
  );
}
