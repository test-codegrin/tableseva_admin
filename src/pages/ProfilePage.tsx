import { useEffect, useState } from "react";
import { toast } from "sonner";
import { updateVendorProfileApi } from "../api/authApi";
import { updateRazorpayKeysApi } from "../api/paymentApi";
import { Input } from "../components/ui/input";
import { useAuth } from "../context/AuthContext";
import { Icon, ICONS } from "../config/icons";

type ProfileForm = {
  name: string;
  email: string;
  phone: string;
  subdomain: string;
};

type FormErrors = Partial<Record<keyof ProfileForm, string>>;

type RazorpayForm = {
  razorpay_key_id: string;
  razorpay_key_secret: string;
};

type RazorpayFormErrors = Partial<Record<keyof RazorpayForm, string>>;

const tabs = [
  { key: "account", label: "Account Details", icon: ICONS.account },
  { key: "payment", label: "Payment Methods", icon: ICONS.payments },
];

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState("account");
  const [isEditingAccount, setIsEditingAccount] = useState(false);
  const [isSavingAccount, setIsSavingAccount] = useState(false);
  const [isEditingPayment, setIsEditingPayment] = useState(false);
  const [isSavingPayment, setIsSavingPayment] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [paymentErrors, setPaymentErrors] = useState<RazorpayFormErrors>({});
  const [form, setForm] = useState<ProfileForm>({
    name: "",
    email: "",
    phone: "",
    subdomain: "",
  });
  const [razorpayForm, setRazorpayForm] = useState<RazorpayForm>({
    razorpay_key_id: "",
    razorpay_key_secret: "",
  });

  useEffect(() => {
    if (!user) return;
    setForm({
      name: user.name,
      email: user.email,
      phone: user.phone,
      subdomain: user.subdomain,
    });
    setRazorpayForm({
      razorpay_key_id: user.razorpay_key_id || "",
      razorpay_key_secret: "",
    });
  }, [user]);

  if (!user) return null;

  const initials = user.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

  const validateForm = (): FormErrors => {
    const e: FormErrors = {};
    if (!/\S/.test(form.name)) e.name = "Name is required";
    if (!/\S/.test(form.email)) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email";
    if (!/\S/.test(form.phone)) e.phone = "Phone is required";
    else if (!/^\d{10,15}$/.test(form.phone)) e.phone = "Phone must be 10–15 digits";
    if (!/\S/.test(form.subdomain)) e.subdomain = "Subdomain is required";
    else if (!/^[a-z0-9-]+$/.test(form.subdomain)) e.subdomain = "Lowercase letters, numbers, hyphens only";
    return e;
  };

  const handleChange = (field: keyof ProfileForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validateRazorpayForm = (): RazorpayFormErrors => {
    const e: RazorpayFormErrors = {};
    if (!/\S/.test(razorpayForm.razorpay_key_id)) {
      e.razorpay_key_id = "Razorpay key ID is required";
    }
    if (!/\S/.test(razorpayForm.razorpay_key_secret)) {
      e.razorpay_key_secret = "Razorpay secret key is required";
    }
    return e;
  };

  const handleRazorpayChange = (field: keyof RazorpayForm, value: string) => {
    setRazorpayForm((prev) => ({ ...prev, [field]: value }));
    setPaymentErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleCancel = () => {
    setIsEditingAccount(false);
    setErrors({});
    setForm({ name: user.name, email: user.email, phone: user.phone, subdomain: user.subdomain });
  };

  const handlePaymentCancel = () => {
    setIsEditingPayment(false);
    setPaymentErrors({});
    setRazorpayForm({
      razorpay_key_id: user.razorpay_key_id || "",
      razorpay_key_secret: "",
    });
  };

  const handleSave = async () => {
    const validationErrors = validateForm();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      toast.error("Validation failed", { description: "Please fix highlighted fields before saving." });
      return;
    }
    setIsSavingAccount(true);
    try {
      await updateVendorProfileApi({ name: form.name, email: form.email, phone: form.phone, subdomain: form.subdomain });
      await refreshUser();
      setIsEditingAccount(false);
      toast.success("Profile updated", { description: "Your changes were saved successfully." });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not update profile.";
      toast.error("Update failed", { description: message });
    } finally {
      setIsSavingAccount(false);
    }
  };

  const handlePaymentSave = async () => {
    const validationErrors = validateRazorpayForm();
    setPaymentErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      toast.error("Validation failed", { description: "Please enter both Razorpay fields before saving." });
      return;
    }

    setIsSavingPayment(true);
    try {
      await updateRazorpayKeysApi({
        razorpay_key_id: razorpayForm.razorpay_key_id.trim(),
        razorpay_key_secret: razorpayForm.razorpay_key_secret,
      });
      await refreshUser();
      setIsEditingPayment(false);
      setRazorpayForm((prev) => ({ ...prev, razorpay_key_secret: "" }));
      toast.success("Razorpay updated", { description: "Razorpay keys updated successfully." });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not update Razorpay keys.";
      toast.error("Update failed", { description: message });
    } finally {
      setIsSavingPayment(false);
    }
  };

  return (
    <div className="flex items-start justify-center min-h-full">
      <div className="w-full max-w-3xl border border-zinc-200 bg-white shadow-sm overflow-hidden flex">

        {/* ── Left panel ── */}
        <div className="w-48 shrink-0 border-r border-zinc-100 flex flex-col">

          {/* Avatar */}
          <div className="flex flex-col items-center px-4 pt-8 pb-6 border-b border-zinc-100">
            <div className="relative group cursor-pointer">
              <div className="h-24 w-24 overflow-hidden bg-zinc-100 flex items-center justify-center">
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt={user.name} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold text-zinc-400">{initials || "A"}</span>
                )}
              </div>
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center gap-1">
                <Icon icon={ICONS.account} width={18} className="text-white" />
                <span className="text-[10px] text-white font-medium text-center leading-tight px-1">
                  Click to change photo
                </span>
              </div>
            </div>
            <p className="mt-3 text-sm font-semibold text-zinc-800 text-center truncate w-full">{user.name}</p>
            <p className="text-xs text-zinc-400 text-center truncate w-full">{user.email}</p>
          </div>

          {/* Tabs */}
          <nav className="flex flex-col py-3 px-2 gap-0.5 flex-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2.5 px-3 py-2.5  text-sm font-medium transition text-left w-full ${
                  activeTab === tab.key
                    ? "border-l-4 border-[#CC543A] bg-[#CC543A]/5 text-primary"
                    : "border-l-4 border-transparent text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800"
                }`}
              >
                <Icon icon={tab.icon} width={16} className="shrink-0" />
                <span className="leading-tight">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* ── Right panel ── */}
        <div className="flex-1 flex flex-col min-w-0">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-100">
            <h2 className="text-lg font-semibold text-zinc-800">
              {tabs.find((t) => t.key === activeTab)?.label}
            </h2>
            
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-5">
            {activeTab === "account" && (
              <div className="space-y-4">
                <Input
                  label="Vendor ID *"
                  value={String(user.vendor_id)}
                  disabled
                  readOnly
                />
                <Input
                  label="Restaurant Name *"
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  disabled={!isEditingAccount || isSavingAccount}
                  error={errors.name}
                />
                <Input
                  type="email"
                  label="E-Mail *"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  disabled={!isEditingAccount || isSavingAccount}
                  error={errors.email}
                />
                <Input
                  label="Phone *"
                  value={form.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  disabled={!isEditingAccount || isSavingAccount}
                  error={errors.phone}
                />
                <Input
                  label="Subdomain *"
                  value={form.subdomain}
                  onChange={(e) => handleChange("subdomain", e.target.value)}
                  disabled={!isEditingAccount || isSavingAccount}
                  error={errors.subdomain}
                />
              </div>
            )}

            {activeTab === "payment" && (
              <div className="space-y-4">
                <Input
                  label="Razorpay Key ID"
                  value={razorpayForm.razorpay_key_id}
                  onChange={(e) => handleRazorpayChange("razorpay_key_id", e.target.value)}
                  disabled={!isEditingPayment || isSavingPayment}
                  error={paymentErrors.razorpay_key_id}
                />
                <Input
                  type="password"
                  label="Secret Key"
                  placeholder="Enter Razorpay secret key"
                  value={razorpayForm.razorpay_key_secret}
                  onChange={(e) => handleRazorpayChange("razorpay_key_secret", e.target.value)}
                  disabled={!isEditingPayment || isSavingPayment}
                  error={paymentErrors.razorpay_key_secret}
                />
              </div>
            )}
          </div>

          {/* Footer actions */}
          <div className="px-6 py-4 border-t border-zinc-100 flex justify-end gap-2">
            {activeTab === "account" && (isEditingAccount ? (
              <>
                <button
                  onClick={handleCancel}
                  disabled={isSavingAccount}
                  className="px-4 py-2  border border-zinc-200 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSavingAccount}
                  className="flex items-center gap-2 px-5 py-2  bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition disabled:opacity-50"
                >
                  <Icon icon={ICONS.account} width={14} />
                  {isSavingAccount ? "Saving..." : "Update"}
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditingAccount(true)}
                className="flex items-center gap-2 px-5 py-2 bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition"
              >
                <Icon icon={ICONS.account} width={14} />
                Edit Profile
              </button>
            ))}

            {activeTab === "payment" && (isEditingPayment ? (
              <>
                <button
                  onClick={handlePaymentCancel}
                  disabled={isSavingPayment}
                  className="px-4 py-2 border border-zinc-200 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePaymentSave}
                  disabled={isSavingPayment}
                  className="flex items-center gap-2 px-5 py-2 bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition disabled:opacity-50"
                >
                  <Icon icon={ICONS.payments} width={14} />
                  {isSavingPayment ? "Saving..." : "Update Keys"}
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditingPayment(true)}
                className="flex items-center gap-2 px-5 py-2 bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition"
              >
                <Icon icon={ICONS.payments} width={14} />
                Edit Razorpay
              </button>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
