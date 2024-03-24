import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Menu } from "semantic-ui-react";
import "../styles/headerTabs.css";
import { useAuth } from "../utils/AuthProvider";

function formatPrincipal(principal) {
  if (principal.length <= 10) {
    return principal;
  }

  const split = principal.split('-');
  console.log(split);
  if(split.length>2){
    return `${split[0]}....${split[split.length-1]}`;
  }else{
    // Take the first 5 characters, add ellipsis, and then append the last 3 characters
    return `${principal.slice(0, 5)}....${principal.slice(-4)}`;
  }
}

const Tabs = () => {
  const { handleLogin, handleLogout, UID } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const tabs = [
    {name: "Earn", url: 'earn'},
    {name: "Create", url: 'create'},
    {name: "Share", url: 'share'},
    {name: "Manager", url: 'manager'},
    {name: "Book Portal", url: 'book-portal'},
  ];
  const containerWidth = "900px";

  const [activeItem, setActiveItem] = useState();

  useEffect(() => {
    setActiveItem(location.pathname.slice(1));
  }, [location.pathname]);

  const handleItemClick = (item) => {
    setActiveItem(item.url);
    navigate(item.url);
  };

  return (
    <div className="flex justify-between items-center">
      <div 
        className="relative gap-10 px-10 basis-2/3 flex-shrink-0 flex justify-around items-center bg-white border border-solid border-gray-300 rounded-3xl"
        style={{
          boxShadow:
            "0 0 3px rgba(0, 0, 0, .1), 0 0 6px rgba(0, 0, 0, .1), 0 0 9px rgba(0, 0, 0, .1), 0 0 12px rgba(0, 0, 0, .1), 0 0 15px rgba(0, 0, 0, .1)",
          boxShadow:
            "0 0 3px rgba(255, 255, 255, .1), 0 0 6px rgba(255, 255, 255, .1), 0 0 9px rgba(255, 255, 255, .1), 0 0 12px rgba(255, 255, 255, .1), 0 0 15px rgba(255, 255, 255, .1)",
          background:
            "linear-gradient(to right, #7f00ff, #483d8b, #4682b4, #20b2aa, #a3be8c, #d08770)",
        }}
      >
        {tabs.map((tab) =>(
          <div className="relative flex-grow flex justify-center">
            <Menu.Item
              key={tab.name}
              name={tab.name}
              active={activeItem === tab.url}
              onClick={() => handleItemClick(tab)}
              className="cursor-pointer"
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
            {activeItem == tab.url && 
              <div
                style={{
                  position: "absolute",
                  bottom: "-7px",
                  height: "7px",
                  width: "100%",
                  border: "1px solid white",
                  background: "grey",
                  borderRadius: "0 0 10px 10px",
                  transition: "0.3s",
                }}
              ></div>
            }
          </div>)
        )}
      </div>
      <div className="authTab my-0">
        <div className="innerAuthTab">
          {UID && <label className="border-right">{formatPrincipal(UID)}</label>}
          {UID ? (
            <label onClick={handleLogout}>Logout</label>
          ) : (
            <label onClick={handleLogin}>Login</label>
          )}
        </div>
      </div>
    </div>
  );
};

export default Tabs;
