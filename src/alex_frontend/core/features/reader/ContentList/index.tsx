import React, { useState } from "react";
import { Dropdown, Menu } from "antd";
import "./styles.css"; // Import the custom CSS
import { useReader } from "../lib/hooks/useReaderContext";
import { TocItem } from "../lib/components/TocItem";
import { ChevronDown, ChevronUp } from "lucide-react";

const ContentList: React.FC = () => {
  const [dropUp, setDropUp] = useState(false);
  const { chapters } = useReader();

  const handleMenuClick = (e: any) => {
    console.log("click", e);
  };

  const menu = (
    <Menu
      className="content-dropdown-menu custom-scrollbar rounded"
      selectable
      defaultSelectedKeys={["1"]}
      onClick={handleMenuClick}
    >
      {chapters?.map((item, i) => (
        <Menu.Item key={i} className="cursor-pointer">
          <TocItem tocItem={item} />
        </Menu.Item>
      ))}
    </Menu>
  );

  return (
    <Dropdown
      overlay={menu}
      onVisibleChange={(visible) => setDropUp(visible)}
      trigger={["click"]}
      className="z-50 cursor-pointer"
    //   overlayClassName="content-dropdown-menu"
    >
      <div className="font-roboto-condensed font-medium text-base text-white p-2 rounded border border-solid border-white flex justify-between items-center gap-2">
        <span>Content List</span>
        {dropUp ? <ChevronUp size={20} />: <ChevronDown size={20} />}
      </div>
    </Dropdown>
  );
};

export default ContentList;
