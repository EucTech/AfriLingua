"use client";

import React from "react";

interface LayoutWrapperProps {
  children: React.ReactNode;
}

const LayoutWrapper: React.FC<LayoutWrapperProps> = ({ children }) => {
  return <>{children}</>;
};

export default LayoutWrapper;
