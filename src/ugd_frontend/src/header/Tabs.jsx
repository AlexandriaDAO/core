import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Menu } from "semantic-ui-react";
import "../styles/headerTabs.css";
import { useAuth } from "../utils/AuthProvider";

const Tabs = () => {
  const { handleLogin, handleLogout, UID } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const tabs = ["Earn", "Create", "Share"];
  const containerWidth = "60vw";

  const [activeItem, setActiveItem] = useState(
    location.pathname.slice(1) || "create"
  );

  useEffect(() => {
    setActiveItem(location.pathname.slice(1) || "create");
  }, [location.pathname]);

  const handleItemClick = (name) => {
    setActiveItem(name.toLowerCase());
    navigate("/" + name.toLowerCase());
  };

  return (
    <>
      <div className="authTab">
        <div className="innerAuthTab">
          {UID && <label className="border-right">{UID}</label>}
          {UID ? (
            <label onClick={handleLogout}>Logout</label>
          ) : (
            <label onClick={handleLogin}>Login</label>
          )}
        </div>
      </div>
      <div
        style={{
          width: containerWidth,
          maxWidth: "550px",
          minWidth: "280px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            flex: 2,
            display: "flex",
            justifyContent: "space-around",
            alignItems: "center",
            padding: "0px",
            borderRadius: "25px",
            border: "1px solid #ddd",
            background: "white",
            position: "relative",
            boxShadow:
              "0 0 3px rgba(0, 0, 0, .1), 0 0 6px rgba(0, 0, 0, .1), 0 0 9px rgba(0, 0, 0, .1), 0 0 12px rgba(0, 0, 0, .1), 0 0 15px rgba(0, 0, 0, .1)",
            boxShadow:
              "0 0 3px rgba(255, 255, 255, .1), 0 0 6px rgba(255, 255, 255, .1), 0 0 9px rgba(255, 255, 255, .1), 0 0 12px rgba(255, 255, 255, .1), 0 0 15px rgba(255, 255, 255, .1)",
            background:
              "linear-gradient(to right, #7f00ff, #483d8b, #4682b4, #20b2aa, #a3be8c, #d08770)",
          }}
        >
          <div
            style={{
              position: "absolute",
              bottom: "-7px",
              height: "7px",
              width: "33%",
              border: "1px solid white",
              background: "grey",
              borderRadius: "0 0 10px 10px",
              transition: "0.3s",
              left:
                activeItem === "earn"
                  ? "15px"
                  : activeItem === "create"
                  ? "34%"
                  : "64.5%",
            }}
          ></div>
          {tabs.map((tab) =>
            <Menu.Item
              key={tab}
              name={tab}
              active={activeItem === tab.toLowerCase()}
              onClick={() => handleItemClick(tab)}
              style={{
                fontSize: "28px",
                fontWeight: "bold",
                fontFamily: "Arial",
                color: "white",
                flex: 1,
                textAlign: "center",
                borderRadius: "10px 10px 0 0",
              }}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default Tabs;
