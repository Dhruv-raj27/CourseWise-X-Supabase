import React from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../lib/supabase";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    // Supabase will handle the hash fragment and set the session
    // You can redirect to home or dashboard after a short delay
    setTimeout(() => {
      navigate("/");
    }, 1000);
  }, [navigate]);

  return <div>Processing login...</div>;
} 