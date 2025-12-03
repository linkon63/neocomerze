import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState, useEffect } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { collection, doc, getDoc } from "firebase/firestore";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { divisions, districts } from "../../data/locations";
import { useAuth } from "@/context/auth-context";
import { endpoints } from "@/constants/api";
import { db } from "@/utils/firebase";

type AddressItem = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  divisionId: string;
  districtId: string;
  area: string;
  addressLine: string;
  isDefault: boolean;
  postcode: string;
  country: string;
};

type FormState = {
  firstName: string;
  lastName: string;
  phone: string;
  divisionId: string;
  districtId: string;
  area: string;
  addressLine: string;
  isDefault: boolean;
  postcode: string;
  country: string;
};

const initialForm: FormState = {
  firstName: "",
  lastName: "",
  phone: "",
  divisionId: "",
  districtId: "",
  area: "",
  addressLine: "",
  isDefault: false,
  postcode: "",
  country: "Bangladesh",
};

const initialAddresses: AddressItem[] = [];

export function AddressCard() {
  const { userPhone } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<
    Partial<Record<keyof FormState, string>>
  >({});
  const [addressList, setAddressList] =
    useState<AddressItem[]>(initialAddresses);
  const [divisionOpen, setDivisionOpen] = useState(false);
  const [districtOpen, setDistrictOpen] = useState(false);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [loadingExisting, setLoadingExisting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredDistricts = useMemo(
    () => districts.filter((d) => d.division_id === form.divisionId),
    [form.divisionId]
  );

  const divisionName = (id: string) =>
    divisions.find((d) => d.id === id)?.name || "";
  const districtName = (id: string) =>
    districts.find((d) => d.id === id)?.name || "";

  useEffect(() => {
    if (userPhone && !form.phone) {
      setForm((prev) => ({ ...prev, phone: userPhone }));
    }
  }, [userPhone, form.phone]);

  useEffect(() => {
    const loadCustomer = async () => {
      if (!userPhone) return;
      setLoadingExisting(true);
      try {
        const snap = await getDoc(doc(collection(db, "users"), userPhone));
        if (snap.exists()) {
          const data = snap.data() as {
            customer_id?: string;
            first_name?: string;
            last_name?: string;
            email?: string;
            phone?: string;
            address_line?: string;
          };
          if (data?.customer_id) {
            setCustomerId(data.customer_id);
          }
          setForm((prev) => ({
            ...prev,
            firstName: data?.first_name || prev.firstName,
            lastName: data?.last_name || prev.lastName,
            phone: data?.phone || prev.phone || userPhone,
            addressLine: data?.address_line || prev.addressLine,
          }));
        }
      } catch {
        // ignore
      } finally {
        setLoadingExisting(false);
      }
    };
    loadCustomer();
  }, [userPhone]);

  useEffect(() => {
    const fetchAddresses = async () => {
      if (!customerId) return;
      setLoadingExisting(true);
      try {
        const res = await fetch(`${endpoints.customers}/${customerId}`);
        if (!res.ok) {
          throw new Error(`Address fetch failed (${res.status})`);
        }
        const json: any = await res.json();
        const rawAddresses =
          (json?.data?.addresses as any[]) ||
          (json?.addresses as any[]) ||
          (json?.data?.mailing_address ? [json.data.mailing_address] : []) ||
          (json?.mailing_address ? [json.mailing_address] : []);

        if (Array.isArray(rawAddresses) && rawAddresses.length) {
          const mapped: AddressItem[] = rawAddresses.map((a, idx) => ({
            id: a?.id?.toString() || `remote-${idx}`,
            firstName: a?.first_name || form.firstName || "",
            lastName: a?.last_name || form.lastName || "",
            phone: a?.phone || form.phone || userPhone || "",
            divisionId: "",
            districtId: "",
            area: a?.city || form.area || "",
            addressLine: a?.address || a?.addressLine || "",
            isDefault: Boolean(a?.is_default),
            postcode: a?.postcode || "",
            country: a?.country || form.country || "Bangladesh",
          }));
          setAddressList(mapped);
        }
      } catch (err: any) {
        setStatus(err?.message || "Could not load addresses");
      } finally {
        setLoadingExisting(false);
      }
    };
    fetchAddresses();
  }, [customerId]);

  const handleChange = (key: keyof FormState, value: string | boolean) => {
    setForm((prev) => {
      const next = {
        ...prev,
        [key]: value,
      };
      if (key === "divisionId") {
        next.districtId = "";
      }
      return next;
    });
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleSubmit = async () => {
    setStatus(null);
    const nextErrors: Partial<Record<keyof FormState, string>> = {};
    (
      [
        "firstName",
        "lastName",
        "phone",
        "divisionId",
        "districtId",
        "area",
        "addressLine",
        "postcode",
        "country",
      ] as const
    ).forEach((field) => {
      if (!String(form[field]).trim()) {
        nextErrors[field] = "Required";
      }
    });

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length) {
      return;
    }

    if (!customerId) {
      setStatus("Missing customer id. Please re-login or register.");
      return;
    }

    const payload = {
      mailing_address: {
        first_name: form.firstName,
        last_name: form.lastName,
        phone: form.phone,
        type: "billing",
        mark_as_both: true,
        is_default: form.isDefault,
        state: divisionName(form.divisionId),
        city: districtName(form.districtId),
        address: `${form.area}, ${form.addressLine}`,
        postcode: form.postcode,
        country: form.country,
      },
    };

    setSubmitting(true);
    try {
      const res = await fetch(`${endpoints.customers}/${customerId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || `Address update failed (${res.status})`);
      }

      setAddressList((prev) => [
        {
          id: `${Date.now()}`,
          firstName: form.firstName,
          lastName: form.lastName,
          phone: form.phone,
          divisionId: form.divisionId,
          districtId: form.districtId,
          area: form.area,
          addressLine: `${form.area}, ${form.addressLine}`,
          isDefault: form.isDefault,
          postcode: form.postcode,
          country: form.country,
        },
        ...prev,
      ]);
      setForm({ ...initialForm, phone: userPhone || "" });
      setShowForm(false);
      setDivisionOpen(false);
      setDistrictOpen(false);
      setStatus("Address updated");
    } catch (err: any) {
      setStatus(err?.message || "Could not update address");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (addressId: string) => {
    if (!customerId) {
      setStatus("Missing customer id. Please re-login or register.");
      return;
    }
    if (!addressId) {
      setStatus("Address id missing.");
      return;
    }

    setDeletingId(addressId);
    setStatus(null);
    try {
      const res = await fetch(
        `${endpoints.customers}/${customerId}/address/${addressId}`,
        {
          method: "DELETE",
          headers: {
            Accept: "application/json",
          },
        }
      );
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || `Delete failed (${res.status})`);
      }
      setAddressList((prev) => prev.filter((addr) => addr.id !== addressId));
      setStatus("Address deleted");
    } catch (err: any) {
      setStatus(err?.message || "Could not delete address");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <ThemedView style={styles.card}>
      <View style={styles.headerRow}>
        <ThemedText style={styles.heading}>Saved addresses</ThemedText>
        <Pressable
          style={styles.createButton}
          onPress={() => setShowForm((prev) => !prev)}
        >
          <Ionicons name="location-outline" size={18} color="#ffffff" />
          <ThemedText style={styles.createButtonText}>
            {showForm ? "Close" : "Address"}
          </ThemedText>
        </Pressable>
      </View>

      {showForm ? (
        <View style={styles.formCard}>
          <View style={styles.formRow}>
            <View style={styles.inputBlock}>
              <ThemedText style={styles.label}>First name</ThemedText>
              <TextInput
                placeholder="First name"
                placeholderTextColor="#9ca3af"
                style={[styles.input, errors.firstName && styles.inputError]}
                value={form.firstName}
                onChangeText={(text) => handleChange("firstName", text)}
              />
              {errors.firstName ? (
                <ThemedText style={styles.errorText}>
                  {errors.firstName}
                </ThemedText>
              ) : null}
            </View>
            <View style={styles.inputBlock}>
              <ThemedText style={styles.label}>Last name</ThemedText>
              <TextInput
                placeholder="Last name"
                placeholderTextColor="#9ca3af"
                style={[styles.input, errors.lastName && styles.inputError]}
                value={form.lastName}
                onChangeText={(text) => handleChange("lastName", text)}
              />
              {errors.lastName ? (
                <ThemedText style={styles.errorText}>
                  {errors.lastName}
                </ThemedText>
              ) : null}
            </View>
          </View>

          <View style={styles.formRow}>
            <View style={styles.inputBlock}>
              <ThemedText style={styles.label}>Phone</ThemedText>
              <TextInput
                placeholder="+880 1XXXXXXXXX"
                placeholderTextColor="#9ca3af"
                keyboardType="phone-pad"
                style={[styles.input, errors.phone && styles.inputError]}
                value={form.phone}
                onChangeText={(text) => handleChange("phone", text)}
              />
              {errors.phone ? (
                <ThemedText style={styles.errorText}>{errors.phone}</ThemedText>
              ) : null}
            </View>
          </View>

          <View style={styles.formRow}>
            <View style={styles.inputBlock}>
              <ThemedText style={styles.label}>Division</ThemedText>
              <View
                style={[styles.select, errors.divisionId && styles.inputError]}
              >
                <Pressable
                  style={styles.selectTrigger}
                  onPress={() => {
                    setDivisionOpen((prev) => !prev);
                    setDistrictOpen(false);
                  }}
                >
                  <ThemedText style={styles.selectText}>
                    {form.divisionId
                      ? divisionName(form.divisionId)
                      : "Select division"}
                  </ThemedText>
                  <Ionicons
                    name={divisionOpen ? "chevron-up" : "chevron-down"}
                    size={18}
                    color="#6b7280"
                  />
                </Pressable>
                {divisionOpen ? (
                  <View style={styles.dropdown}>
                    <ScrollView style={styles.dropdownScroll}>
                      {divisions.map((item) => (
                        <Pressable
                          key={item.id}
                          style={styles.option}
                          onPress={() => {
                            handleChange("divisionId", item.id);
                            setDivisionOpen(false);
                          }}
                        >
                          <ThemedText style={styles.optionText}>
                            {item.name}
                          </ThemedText>
                        </Pressable>
                      ))}
                    </ScrollView>
                  </View>
                ) : null}
              </View>
              {errors.divisionId ? (
                <ThemedText style={styles.errorText}>
                  {errors.divisionId}
                </ThemedText>
              ) : null}
            </View>

            <View style={styles.inputBlock}>
              <ThemedText style={styles.label}>District</ThemedText>
              <View
                style={[styles.select, errors.districtId && styles.inputError]}
              >
                <Pressable
                  style={styles.selectTrigger}
                  onPress={() => {
                    setDistrictOpen((prev) => !prev);
                    setDivisionOpen(false);
                  }}
                >
                  <ThemedText style={styles.selectText}>
                    {form.districtId
                      ? districtName(form.districtId)
                      : "Select district"}
                  </ThemedText>
                  <Ionicons
                    name={districtOpen ? "chevron-up" : "chevron-down"}
                    size={18}
                    color="#6b7280"
                  />
                </Pressable>
                {districtOpen ? (
                  <View style={styles.dropdown}>
                    <ScrollView style={styles.dropdownScroll}>
                      {filteredDistricts.map((item) => (
                        <Pressable
                          key={item.id}
                          style={styles.option}
                          onPress={() => {
                            handleChange("districtId", item.id);
                            setDistrictOpen(false);
                          }}
                        >
                          <ThemedText style={styles.optionText}>
                            {item.name}
                          </ThemedText>
                        </Pressable>
                      ))}
                    </ScrollView>
                  </View>
                ) : null}
              </View>
              {errors.districtId ? (
                <ThemedText style={styles.errorText}>
                  {errors.districtId}
                </ThemedText>
              ) : null}
            </View>
          </View>

          <View style={styles.formRow}>
            <View style={styles.inputBlock}>
              <ThemedText style={styles.label}>Area</ThemedText>
              <TextInput
                placeholder="Area"
                placeholderTextColor="#9ca3af"
                style={[styles.input, errors.area && styles.inputError]}
                value={form.area}
                onChangeText={(text) => handleChange("area", text)}
              />
              {errors.area ? (
                <ThemedText style={styles.errorText}>{errors.area}</ThemedText>
              ) : null}
            </View>
            <View style={styles.inputBlock}>
              <ThemedText style={styles.label}>Address</ThemedText>
              <TextInput
                placeholder="House, road, block"
                placeholderTextColor="#9ca3af"
                style={[styles.input, errors.addressLine && styles.inputError]}
                value={form.addressLine}
                onChangeText={(text) => handleChange("addressLine", text)}
              />
              {errors.addressLine ? (
                <ThemedText style={styles.errorText}>
                  {errors.addressLine}
                </ThemedText>
              ) : null}
            </View>
          </View>

          <View style={styles.formRow}>
            <View style={styles.inputBlock}>
              <ThemedText style={styles.label}>Postcode</ThemedText>
              <TextInput
                placeholder="Postcode"
                placeholderTextColor="#9ca3af"
                style={[styles.input, errors.postcode && styles.inputError]}
                value={form.postcode}
                onChangeText={(text) => handleChange("postcode", text)}
              />
              {errors.postcode ? (
                <ThemedText style={styles.errorText}>
                  {errors.postcode}
                </ThemedText>
              ) : null}
            </View>
            <View style={styles.inputBlock}>
              <ThemedText style={styles.label}>Country</ThemedText>
              <TextInput
                placeholder="Country"
                placeholderTextColor="#9ca3af"
                style={[styles.input, errors.country && styles.inputError]}
                value={form.country}
                onChangeText={(text) => handleChange("country", text)}
              />
              {errors.country ? (
                <ThemedText style={styles.errorText}>
                  {errors.country}
                </ThemedText>
              ) : null}
            </View>
          </View>

          <Pressable
            style={styles.checkboxRow}
            onPress={() => handleChange("isDefault", !form.isDefault)}
          >
            <Ionicons
              name={form.isDefault ? "checkbox" : "square-outline"}
              size={22}
              color={form.isDefault ? "#f97316" : "#6b7280"}
            />
            <ThemedText style={styles.checkboxLabel}>
              Set as default address
            </ThemedText>
          </Pressable>

          <Pressable
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={submitting || loadingExisting}
          >
            <ThemedText style={styles.submitText}>
              {submitting
                ? "Saving…"
                : loadingExisting
                ? "Loading…"
                : "Save address"}
            </ThemedText>
          </Pressable>
          {status ? (
            <ThemedText style={styles.statusText}>{status}</ThemedText>
          ) : null}
        </View>
      ) : null}

      <View style={styles.stack}>
        {addressList.length === 0 ? (
          <ThemedText style={styles.emptyText}>
            There is no address. Please add an address.
          </ThemedText>
        ) : (
          addressList.map((item) => (
            <View key={item.id} style={styles.row}>
              <View style={styles.badge}>
                <ThemedText style={styles.badgeText}>
                  {item.firstName.slice(0, 1).toUpperCase()}
                </ThemedText>
              </View>

              <View style={styles.textBlock}>
                <View style={styles.rowHeader}>
                  <ThemedText style={styles.label}>
                    {item.firstName} {item.lastName}
                  </ThemedText>
                  <View style={styles.rowActions}>
                    {item.isDefault ? (
                      <ThemedText style={styles.defaultPill}>
                        Default
                      </ThemedText>
                    ) : null}
                    <Pressable
                      style={styles.deleteButton}
                      onPress={() => handleDelete(item.id)}
                      disabled={deletingId === item.id}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={16}
                        color="#b91c1c"
                      />
                      <ThemedText style={styles.deleteText}>
                        {deletingId === item.id ? "Deleting…" : "Delete"}
                      </ThemedText>
                    </Pressable>
                  </View>
                </View>
                <ThemedText style={styles.detail}>{item.phone}</ThemedText>
                <ThemedText style={styles.detail}>
                  {item.addressLine}
                </ThemedText>
                <ThemedText style={styles.detail}>
                  {item.area}, {districtName(item.districtId)},{" "}
                  {divisionName(item.divisionId)}
                </ThemedText>
              </View>
            </View>
          ))
        )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    backgroundColor: "#ffffff",
    borderRadius: 0,
    borderWidth: 1,
    borderColor: "#f1f3f5",
    shadowColor: "#0f172a",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 12,
    gap: 12,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#f97316",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 0,
  },
  createButtonText: {
    color: "#ffffff",
    fontWeight: "800",
    fontSize: 14,
  },
  heading: {
    fontWeight: "800",
    fontSize: 18,
    color: "#111827",
  },
  formCard: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#fffaf5",
    gap: 12,
  },
  formRow: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
  },
  inputBlock: {
    flex: 1,
    minWidth: "45%",
  },
  label: {
    fontWeight: "800",
    fontSize: 14,
    color: "#111827",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 0,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: "#ffffff",
  },
  inputError: {
    borderColor: "#ef4444",
  },
  errorText: {
    color: "#b91c1c",
    fontSize: 12,
    marginTop: 4,
  },
  select: {
    position: "relative",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 0,
    backgroundColor: "#ffffff",
  },
  selectTrigger: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectText: {
    fontSize: 14,
    color: "#111827",
  },
  dropdown: {
    borderTopWidth: 1,
    borderColor: "#e5e7eb",
    maxHeight: 200,
  },
  dropdownScroll: {
    maxHeight: 200,
  },
  option: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  optionText: {
    fontSize: 14,
    color: "#111827",
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  checkboxLabel: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "700",
  },
  submitButton: {
    backgroundColor: "#0f172a",
    paddingVertical: 12,
    borderRadius: 0,
    alignItems: "center",
  },
  submitText: {
    color: "#ffffff",
    fontWeight: "800",
    fontSize: 15,
  },
  statusText: {
    color: "#0f172a",
    fontSize: 13,
  },
  emptyText: {
    color: "#6b7280",
    fontSize: 13,
  },
  stack: {
    gap: 14,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  badge: {
    width: 44,
    height: 44,
    borderRadius: 0,
    backgroundColor: "#fff1e9",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: "#f97316",
    fontWeight: "800",
    fontSize: 16,
  },
  textBlock: {
    flex: 1,
    gap: 4,
  },
  rowHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  rowActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detail: {
    color: "#4b5563",
    fontSize: 13,
    lineHeight: 19,
  },
  defaultPill: {
    backgroundColor: "#ecfdf3",
    color: "#15803d",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 0,
    fontWeight: "800",
    fontSize: 11,
  },
  deleteButton: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: "#fee2e2",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  deleteText: {
    color: "#b91c1c",
    fontWeight: "800",
    fontSize: 12,
  },
});
