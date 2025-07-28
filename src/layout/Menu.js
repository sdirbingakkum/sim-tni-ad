import React, { useState, createElement } from "react";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import { useMediaQuery } from "@material-ui/core";
import { DashboardMenuItem, MenuItemLink } from "react-admin";
import {
  AccountBalance,
  AspectRatio,
  Style,
  TransferWithinAStation,
  People,
  Public,
  KeyboardArrowRight,
} from "@material-ui/icons";
import { List, ListSubheader, Divider } from "@material-ui/core";
import SubMenu from "./SubMenu";

const Menu = ({ onMenuClick, dense, logout }) => {
  const isXsmall = useMediaQuery((theme) => theme.breakpoints.down("xs"));
  const open = useSelector((state) => state.admin.ui.sidebarOpen);
  useSelector((state) => state.theme); // force rerender on theme change

  // const handleToggle = menu => {
  //   setState(state => ({ ...state, [menu]: !state[menu] }));
  // };

  return (
    <div>
      {" "}
      <DashboardMenuItem onClick={onMenuClick} sidebarIsOpen={open} />
      <MenuItemLink
        to={`/sim`}
        primaryText={"SIM"}
        leftIcon={createElement(Style)}
        onClick={onMenuClick}
        sidebarIsOpen={open}
        dense={dense}
      />
      <MenuItemLink
        to={`/pemohon`}
        primaryText={"Pemohon"}
        leftIcon={createElement(People)}
        onClick={onMenuClick}
        sidebarIsOpen={open}
        dense={dense}
      />
      <MenuItemLink
        to={`/pengguna`}
        primaryText={"Pengguna"}
        leftIcon={createElement(TransferWithinAStation)}
        onClick={onMenuClick}
        sidebarIsOpen={open}
        dense={dense}
      />
      <MenuItemLink
        to={`/satlak`}
        primaryText={"SATLAK"}
        leftIcon={createElement(AccountBalance)}
        onClick={onMenuClick}
        sidebarIsOpen={open}
        dense={dense}
      />
      <Divider />
      {isXsmall && logout}
    </div>
  );
};

Menu.propTypes = {
  onMenuClick: PropTypes.func,
  logout: PropTypes.object,
};

export default Menu;
