"use client";

import { Button } from "./ui/button";
import React from "react";

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text: string;
}

const WalletButton = (props: Props) => {
  return <Button {...props}>{props.text}</Button>;
};

export default WalletButton;
