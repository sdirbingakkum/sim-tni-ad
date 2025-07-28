import React from "react";
import { Layout } from "react-admin";
import Menu from "./Menu";
import CustomAppBar from "./AppBar";

const AppLayout = props => (
  <Layout {...props} menu={Menu} appBar={CustomAppBar} />
);

export default AppLayout;
