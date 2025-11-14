"use client";
import { useEffect, useState } from "react";
import { v4 } from "uuid";

export const useUser = () => {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    let id = localStorage.getItem("userId");

    if (!id) {
      id = v4();
      localStorage.setItem("userId", id);
    }

    setUserId(id);
  }, []);

  return userId;
};
