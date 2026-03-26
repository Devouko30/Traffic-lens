import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { format } from "date-fns";
import { useAuth } from "../hooks/AuthContext";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import {
  Activity, ArrowLeft, Plus, Trash2, Edit2, X, MapPin,
  Video, Sliders, Calendar, Loader2, AlertTriangle,
} from "lucide-react";

interface Site {
  id: string; name: string; location: string;
  rtsp_url: string; line_y_ratio: number; created_at: string;
}

const EMPTY_FORM = { id: "", name: "", location: "", rtsp_url: "", line_y_ratio: "0.6" };

function SiteFormModal({
  initial,
  onClose,
  onSave,
}: {
  initial?: Site;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
}) {
  const [form, setForm] = useState(
    initial
      ? { ...initial, line_y_ratio: String(initial.line_y_ratio) }
      : EMPTY_FORM
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const isEdit = !!initial;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await onSave({ ...form, line_y_ratio: parseFloat(form.line_y_ratio) });
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? "Operation failed.");
    } finally {
      setLoading(false);
    }
  }

  const fields = [
    { id: "name", label: "Display Name", placeholder: "Site 19", disabled: false },
    { id: "location", label: "Location", placeholder: "Mombasa Bonje", disabled: false },
    { id: "rtsp_url", label: "RTSP / Video URL", placeholder: "rtsp://... or sample.mp4", disabled: false },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass-strong rounded-2xl p-6 w-full max-w-md shadow-glass-lg animate-scale-in">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-zinc-100">
            {isEdit ? "Edit Site" : "Add Monitoring Site"}
          </h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-3">
          {!isEdit && (
            <div className="space-y-1">
              <Label htmlFor="id">Site ID <span className="text-zinc-600">(immutable)</span></Label>
              <Input
                id="id" required
                value={form.id}
                onChange={e => setForm(p => ({ ...p, id: e.target.value }))}
                placeholder="site_19_mombasa"
              />
            </div>
          )}

          {fields.map(f => (
            <div key={f.id} className="space-y-1">
              <Label htmlFor={f.id}>{f.label}</Label>
              <Input
                id={f.id} required
                value={(form as any)[f.id]}
                onChange={e => setForm(p => ({ ...p, [f.id]: e.target.value }))}
                placeholder={f.placeholder}
              />
            </div>
          ))}

          <div className="space-y-1">
            <Label htmlFor="line_y_ratio">
              Counting line Y ratio
              <span className="text-zinc-600 ml-1 font-normal">(0.1 â€“ 0.9)</span>
            </Label>
            <div className="flex items-center gap-3">
              <Input
                id="line_y_ratio" type="range" min="0.1" max="0.9" step="0.05"
                value={form.line_y_ratio}
                onChange={e => setForm(p => ({ ...p, line_y_ratio: e.target.value }))}
                className="flex-1 h-2 cursor-pointer accent-[#D4FF33]"
              />
              <span className="text-sm text-zinc-300 w-10 text-right tabular-nums">
                {parseFloat(form.line_y_ratio).toFixed(2)}
              </span>
            </div>
          </div>

          {error && (
            <p className="text-xs rounded-lg px-3 py-2" style={{ color: "rgba(212,255,51,0.7)", background: "rgba(212,255,51,0.06)", border: "1px solid rgba(212,255,51,0.15)" }}>
              {error}
            </p>
          )}

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="glow" className="flex-1" disabled={loading}>
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Savingâ€¦</>
                : isEdit ? "Save Changes" : "Create Site"
              }
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteConfirmModal({
  site,
  onClose,
  onConfirm,
}: {
  site: Site;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);

  async function confirm() {
    setLoading(true);
    await onConfirm();
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass-strong rounded-2xl p-6 w-full max-w-sm shadow-glass-lg animate-scale-in">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: "rgba(212,255,51,0.08)", border: "1px solid rgba(212,255,51,0.15)" }}>
            <AlertTriangle className="w-6 h-6" style={{ color: "rgba(212,255,51,0.6)" }} />
          </div>
          <div>
            <h2 className="font-semibold text-zinc-100 mb-1">Delete site?</h2>
            <p className="text-sm text-zinc-500">
              <span className="text-zinc-300">{site.name}</span> and all its event data will be
              permanently removed. This cannot be undone.
            </p>
          </div>
          <div className="flex gap-2 w-full">
            <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button variant="destructive" className="flex-1" onClick={confirm} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Sites() {
  const { authHeader } = useAuth();
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [editSite, setEditSite] = useState<Site | null>(null);
  const [deleteSite, setDeleteSite] = useState<Site | null>(null);
  const [search, setSearch] = useState("");

  const { data: sites = [], isLoading } = useQuery<Site[]>({
    queryKey: ["sites"],
    queryFn: () => axios.get("/api/v1/sites", { headers: authHeader() }).then(r => r.data),
  });

  const filtered = sites.filter(
    s =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.location.toLowerCase().includes(search.toLowerCase()) ||
      s.id.toLowerCase().includes(search.toLowerCase())
  );

  async function createSite(data: any) {
    await axios.post("/api/v1/sites", data, { headers: authHeader() });
    queryClient.invalidateQueries({ queryKey: ["sites"] });
    toast.success("Site created successfully");
  }

  async function updateSite(data: any) {
    await axios.patch(`/api/v1/sites/${data.id}`, data, { headers: authHeader() });
    queryClient.invalidateQueries({ queryKey: ["sites"] });
    toast.success("Site updated");
  }

  async function confirmDelete() {
    if (!deleteSite) return;
    await axios.delete(`/api/v1/sites/${deleteSite.id}`, { headers: authHeader() });
    queryClient.invalidateQueries({ queryKey: ["sites"] });
    toast.info(`${deleteSite.name} deleted`);
    setDeleteSite(null);
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0"
          style={{
            backgroundImage: "linear-gradient(rgba(148,163,184,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.03) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
        <div className="orb w-[500px] h-[500px] -top-40 -right-40" style={{ background: "rgba(212,255,51,0.04)" }} />
        <div className="orb w-[400px] h-[400px] bottom-0 -left-40" style={{ background: "rgba(212,255,51,0.03)", animationDelay: "-6s" }} />
      </div>

      {/* Header */}
      <header className="glass-nav sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/dashboard">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(212,255,51,0.12)", border: "1px solid rgba(212,255,51,0.25)" }}>
              <Activity className="w-4 h-4" style={{ color: "#D4FF33" }} />
            </div>
            <span className="font-semibold text-sm text-zinc-100">Sites</span>
            <Badge variant="secondary" className="text-xs">{sites.length}</Badge>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Input
                className="h-8 pl-3 pr-3 text-xs w-48"
                placeholder="Search sitesâ€¦"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <Button size="sm" variant="glow" className="h-8 gap-1.5 text-xs"
              onClick={() => setShowAdd(true)}>
              <Plus className="w-3.5 h-3.5" /> Add Site
            </Button>
          </div>
        </div>
      </header>

      <main className="relative flex-1 max-w-7xl mx-auto w-full px-6 py-6">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="glass-card rounded-2xl h-48 shimmer" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-40 gap-5 text-zinc-600">
            <div className="w-16 h-16 glass-card rounded-2xl flex items-center justify-center">
              <MapPin className="w-8 h-8 text-zinc-700" />
            </div>
            <div className="text-center">
              <p className="text-sm text-zinc-500 mb-1">
                {search ? "No sites match your search" : "No sites yet"}
              </p>
              {!search && (
                <p className="text-xs text-zinc-700">Add a monitoring site to get started</p>
              )}
            </div>
            {!search && (
              <Button variant="outline" size="sm" onClick={() => setShowAdd(true)} className="gap-1.5">
                <Plus className="w-3.5 h-3.5" /> Add your first site
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((site, i) => (
              <Card
                key={site.id}
                className="group animate-fade-up"
                style={{ animationDelay: `${i * 0.06}s` }}
              >
                <CardHeader className="pb-3 px-5 pt-5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <CardTitle className="text-sm truncate">{site.name}</CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span className="truncate">{site.location}</span>
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <Button
                        variant="ghost" size="icon"
                        className="h-7 w-7 text-zinc-500 hover:text-zinc-200"
                        onClick={() => setEditSite(site)}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost" size="icon"
                        className="h-7 w-7 text-zinc-500 hover:text-[#D4FF33]"
                        onClick={() => setDeleteSite(site)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="px-5 pb-5 space-y-3">
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-zinc-500">
                      <Video className="w-3.5 h-3.5 shrink-0 text-zinc-600" />
                      <span className="truncate font-mono text-zinc-400">{site.rtsp_url}</span>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-500">
                      <Sliders className="w-3.5 h-3.5 shrink-0 text-zinc-600" />
                      <span>Line at {(site.line_y_ratio * 100).toFixed(0)}% height</span>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-500">
                      <Calendar className="w-3.5 h-3.5 shrink-0 text-zinc-600" />
                      <span>Added {format(new Date(site.created_at), "dd MMM yyyy")}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <Link to={`/dashboard?site=${site.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full h-7 text-xs gap-1">
                        <Activity className="w-3 h-3" /> Monitor
                      </Button>
                    </Link>
                    <Link to={`/analytics?site=${site.id}`} className="flex-1">
                      <Button variant="ghost" size="sm" className="w-full h-7 text-xs gap-1">
                        Analytics
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {showAdd && (
        <SiteFormModal onClose={() => setShowAdd(false)} onSave={createSite} />
      )}
      {editSite && (
        <SiteFormModal initial={editSite} onClose={() => setEditSite(null)} onSave={updateSite} />
      )}
      {deleteSite && (
        <DeleteConfirmModal
          site={deleteSite}
          onClose={() => setDeleteSite(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}

