import React from "react";
import { Toolbar } from "react-admin";
import SimEditButton from "./SimEditButton";

const SimEditToolbar = props => (
  <Toolbar {...props}>
    <SimEditButton />
  </Toolbar>
);

export default SimEditToolbar;
