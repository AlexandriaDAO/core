import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Menu } from "semantic-ui-react";
import Modal from "react-modal";
import "../styles/headerTabs.css";
import { useAuth } from "../contexts/AuthContext";
import LedgerService from "@/utils/LedgerService";
import { FaCopy } from "react-icons/fa";

const Tabs = () => {
  const { UID, login, logout, accountIdentifier, balanceE8s } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const tabs = [
    {name: "Home", url: '/'},
    {name: "Meili", url: 'meili'},
    {name: "Book Portal", url: 'portal'},
  ];
  
  const [activeItem, setActiveItem] = useState();
  const [copiedText, setCopiedText] = useState("");
  
  const [sendAmount, setSendAmount] = useState("");
  const [recipientAccountId, setRecipientAccountId] = useState("");
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);

  useEffect(() => {
    setActiveItem(location.pathname.slice(1));
  }, [location.pathname]);

  const handleItemClick = (item) => {
    setActiveItem(item.url);
    navigate(item.url);
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      setTimeout(() => {
        setCopiedText("");
      }, 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };


  const openSendModal = () => {
    setIsSendModalOpen(true);
  };
  
  const closeSendModal = () => {
    setIsSendModalOpen(false);
    setSendAmount("");
    setRecipientAccountId("");
  };

  const handleSendIcp = async (e) => {
    e.preventDefault();
    console.log("handleSendICP Triggered.");
    if (sendAmount && recipientAccountId) {
      try {
        const blockHeight = await ledgerService.sendIcp(
          Number(sendAmount),
          recipientAccountId
        );
        console.log("Transfer successful. Block height:", blockHeight);
      } catch (error) {
        console.error("Error sending ICP:", error);
      }
    }
  };

  const ledgerService = LedgerService();

  return (
    <div className="flex justify-between items-center">
      <div 
        className="m-auto relative gap-10 px-10 flex-shrink-0 flex justify-around items-center bg-white border border-solid border-gray-300 rounded-3xl"
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
          <div key={tab.url} className="relative flex-grow flex justify-center">
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
          {UID && (
            <>
              <div className="copyable-wrapper">
                <label
                  className="border-right copyable"
                  onClick={() => copyToClipboard(UID.toString())}
                >
                  {ledgerService.shortPrincipal(UID)}
                </label>
                <FaCopy className="copy-icon" />
              </div>
              <div className="copyable-wrapper">
                <label
                  className="border-right copyable"
                  onClick={() => copyToClipboard(accountIdentifier.toHex())}
                >
                  {ledgerService.shortAccountId(accountIdentifier)}
                </label>
                <FaCopy className="copy-icon" />
              </div>
              <label className="border-right">
                {ledgerService.displayE8sAsIcp(balanceE8s)}
              </label>
              <button onClick={openSendModal}>Send ICP</button>
            </>
          )}
          {UID ? (
            <label onClick={logout}>Logout</label>
          ) : (
            <label onClick={login}>Login</label>
          )}
        </div>
        {copiedText && (
          <div className="copied-text">{copiedText} copied to clipboard!</div>
        )}
      </div>
      <Modal
        isOpen={isSendModalOpen}
        onRequestClose={closeSendModal}
        contentLabel="Send ICP Modal"
      >
      <h2>Send ICP</h2>
        <form onSubmit={handleSendIcp}>
          <input
            type="number"
            placeholder="Amount (ICP)"
            value={sendAmount}
            onChange={(e) => setSendAmount(e.target.value)}
          />
          <input
            type="text"
            placeholder="Recipient Account ID"
            value={recipientAccountId}
            onChange={(e) => setRecipientAccountId(e.target.value)}
          />
          <button type="submit">Send</button>
          <button type="button" onClick={closeSendModal}>
            Cancel
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Tabs;
























