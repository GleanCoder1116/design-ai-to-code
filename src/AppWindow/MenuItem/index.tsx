import React from 'react';
interface MenuItemProps {
    title: string;
    handleClick: () => void;
    icon?: React.ReactNode;
}

// 菜单项组件
const MenuItem = ({title, handleClick, icon}: MenuItemProps) => {
  return (
    <div className="menu-item"
        onClick={handleClick}
    >
      {icon}
      <span className="menu-item-text">{title}</span>
      {/* <span className="menu-item-shortcut">⌘⇧B</span> */}
    </div>
  );
};

export default MenuItem;