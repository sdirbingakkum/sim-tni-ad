import React from "react";
import { Route } from "react-router-dom";
import SimPrintDepan from "../resources/sim/print/SimPrintDepan";
import SimPrintBelakang from "../resources/sim/print/SimPrintBelakang";
import SimShowPemohon from "../resources/sim/print/SimShowPemohon";

export default [
  <Route exact path="/:basePath/print_depan/:id" component={SimPrintDepan} />,
  <Route exact path="/print_belakang/:id" component={SimPrintBelakang} />,
  <Route exact path="/show_sim/:id" component={SimShowPemohon} noLayout />
];
