"use client";
// Home page — college choose karo, batch choose karo, gallery dekho
// NO LOGIN REQUIRED for students

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CollegeStamp from "@/components/ui/CollegeStamp";
import Postmark from "@/components/ui/Postmark";
import Developing from "@/components/ui/Developing";
import { createClient } from "@/lib/supabase/client";
import { useSession } from "@/lib/services/session";
import type { College } from "@/types";

const BATCH_YEARS = Array.from({ length: 8 }, (_, i) => new Date().getFullYear() + 2 - i);

export default function HomePage() {
  const { collegeId, setCollege, setBatch } = useSession();
  const router = useRouter();
  const [colleges, setColleges] = useState<College[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCollegeId, setSelectedCollegeId] = useState<string | null>(null);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [step, setStep] = useState<"college" | "batch">("college");

  // Load colleges from Supabase
  useEffect(() => {
    createClient()
      .from("colleges")
      .select("id, name, city, college_email_domains(domain)")
      .eq("is_active", true)
      .then(({ data }) => {
        if (data) {
          setColleges(data.map((c: any) => ({
            id: c.id, name: c.name, city: c.city,
            emailDomains: c.college_email_domains?.map((d: any) => d.domain) ?? [],
          })));
        }
      });
  }, []);

  // Already has college saved? Skip to gallery
  useEffect(() => {
    if (collegeId) router.replace("/gallery");
  }, [collegeId, router]);
  function handleCollegePick(id: string) {
    setSelectedCollegeId(id);
    setStep("batch");
  }

  function handleBatchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedCollegeId) return;
    setCollege(selectedCollegeId);
    if (selectedBatch) setBatch(selectedBatch);
    router.push("/gallery");
  }

  const filtered = colleges.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.city.toLowerCase().includes(search.toLowerCase())
  );

  if (colleges.length === 0) return <Developing text="Loading colleges…" />;

  // Step 2: Batch selection
  if (step === "batch") {
    const college = colleges.find(c => c.id === selectedCollegeId);
    return (
      <div className="mx-auto max-w-xl px-6 py-20 text-center">
        <p className="label">Step 2 of 2</p>
        <h1 className="font-serif text-4xl mt-2">What's your batch?</h1>
        <p className="mt-3 text-muted text-sm">
          Selected: <strong>{college?.name}</strong>
        </p>
        <form onSubmit={handleBatchSubmit} className="mt-8 space-y-4">
          <select
            value={selectedBatch}
            onChange={e => setSelectedBatch(e.target.value)}
            className="field w-full text-center text-lg"
          >
            <option value="">Select batch (optional)</option>
            {BATCH_YEARS.map(y => (
              <option key={y} value={y}>Class of {y}</option>
            ))}
          </select>
          <button type="submit" className="btn w-full py-4 text-lg">
            Open the Archive →
          </button>
          <button type="button" onClick={() => setStep("college")}
            className="text-sm text-muted underline underline-offset-4">
            ← Change college
          </button>
        </form>
      </div>
    );
  }

  // Step 1: College selection
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <section className="relative">
        <p className="label">Step 1 of 2 · Choose your campus</p>
        <h1 className="max-w-3xl font-serif text-5xl leading-tight md:text-7xl">
          Select your school.
        </h1>
        <p className="mt-4 max-w-lg text-muted">
          Every campus keeps its own archive of memories.
        </p>
        <Postmark
          label="CAMPUSLENS • ARCHIVE • EST 2026 •"
          center="POST"
          className="absolute -top-4 right-0 hidden w-36 rotate-12 text-rust/70 md:block"
        />
        <input
          type="search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by college or city…"
          className="field mt-8 max-w-md"
        />
      </section>

      {filtered.length === 0 ? (
        <p className="mt-16 text-muted">No college matches "{search}".</p>
      ) : (
        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map((college, index) => (
            <button
              key={college.id}
              type="button"
              onClick={() => handleCollegePick(college.id)}
              className={`text-left transition duration-300 hover:-translate-y-2 hover:rotate-0
                ${index % 2 === 0 ? "-rotate-2" : "rotate-2"}`}
            >
              <CollegeStamp college={college} index={index} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
