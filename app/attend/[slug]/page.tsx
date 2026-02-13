import AttendancePortal from "@/components/attendance-portal";
import React from "react";

const AttendanceSession = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;

  return <div> <AttendancePortal sessionCode={slug} /> </div>;
};

export default AttendanceSession;
