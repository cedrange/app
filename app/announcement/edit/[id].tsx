import FontAwesome from "@expo/vector-icons/FontAwesome";
import { yupResolver } from "@hookform/resolvers/yup";
import { Picker } from "@react-native-picker/picker";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import {
    ActivityIndicator,
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import * as yup from "yup";
import DatePicker from "react-native-date-picker";
import { apiService } from "@/services/api";
import { RootState } from "@/store";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchCategories } from "@/store/slices/categoriesSlice";
import { Category, CreateAnnouncementData } from "@/types";
import { useSelector } from "react-redux";

import ImagePickerField from "@/components/imagePickerField";

// ✅ Validation
const announcementSchema = yup.object().shape({
  titre: yup.string().required("Le titre est obligatoire"),
  description: yup.string().required("La description est obligatoire"),
  ville: yup.string().required("La ville est obligatoire"),
  codePostal: yup.string().required("Le code postal est obligatoire"),
  date: yup.string().required("La date est obligatoire"),
  categorieId: yup.number().required("La catégorie est obligatoire"),
  criteres: yup.array().of(
        yup.object().shape({
            id: yup.number().required(),
            libelle: yup.string().required(),
            type: yup.string().required(),
            value: yup.string().required("Champ requis"),
        })
    ),
  type: yup.mixed<"perdu" | "trouvé">().oneOf(["perdu", "trouvé"]).required(),
  secretQuestion: yup.string().optional(),
  photo: yup.object().shape({
    id: yup.number().optional(),
    name: yup.string().optional(),
    data: yup.string().optional(),
    }).optional(),

});

export default function EditAnnouncementScreen() {
  const { id } = useLocalSearchParams();
  const dispatch = useAppDispatch();

  const { data: categories } = useAppSelector((state) => state.categories);
  const announcement = useSelector(
    (state: RootState) => state.announcement.current
  );

  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );

  // ✅ Initialisation avec les valeurs de l’annonce
  const methods = useForm<CreateAnnouncementData>({
    resolver: yupResolver(announcementSchema),
    defaultValues: {
      titre: announcement?.titre_annonce || "",
      description: announcement?.description || "",
      ville: announcement?.ville || "",
      codePostal: announcement?.codePostal || "",
      date: announcement?.date
        ? new Date(announcement.date).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      categorieId: announcement?.categorieId || 0,
      type: announcement?.type || "perdu",
      secretQuestion: announcement?.secretQuestion || "",
      photo: {
        id: announcement?.photo?.id || 0,
        name: announcement?.photo?.name || "",
        data: announcement?.photo?.data || "",
      },
      criteres:
        announcement?.criteres?.map((c) => ({
          id: c.id,
          libelle: c.libelle,
          type: c.type,
          value: c.value || "",
        })) || [],
    },
  });

  const { watch, setValue, handleSubmit, control, formState: { errors } } = methods;

  // ✅ Charger catégories
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // ✅ Quand une catégorie est sélectionnée → mettre à jour criteres
  useEffect(() => {
    if (!categories.length) return;
    const category = categories.find((c) => c.id === watch("categorieId"));
    setSelectedCategory(category || null);

    if (category) {
      const currentCriteres = watch("criteres") || [];
      const merged = category.criteres.map((critere) => {
        const existing = currentCriteres.find((c) => c.id === critere.id);
        const fromAnnouncement = announcement?.criteres?.find(
          (c) => c.id === critere.id
        );
        return {
          id: critere.id,
          libelle: critere.libelle,
          type: critere.type,
          value: existing?.value || fromAnnouncement?.value || "",
        };
      });
      setValue("criteres", merged);
    }
  }, [watch("categorieId"), categories, announcement]);

  // ✅ Soumission
  const onSubmit = async (data: CreateAnnouncementData) => {
    //console.log("✅ Form data:", data);    
    try {
      setLoading(true);
      await apiService.updateAnnouncement(Number(id), data);
      if (data.photo && data.photo.data) {
        //console.log("Payload for announcement:", payload);
            const formData = new FormData();
            formData.append("image", {
            data: data.photo.data,
            name: data.photo.name,
            } as any);      
            await apiService.updateAnnouncementPhoto(data.photo.id, formData);
        }
      Alert.alert("Succès", "Annonce mise à jour avec succès", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (e) {
      Alert.alert("Erreur", "Impossible de mettre à jour l’annonce");
    } finally {
      setLoading(false);
    }
  };

  if (!announcement) {
    return (
      <SafeAreaView style={styles.centeredContainer}>
        <Text>Annonce non trouvée</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Modifier l’annonce</Text>
        <Text style={styles.subtitle}>{announcement.type}</Text>
      </View>

      {/* Sélecteur type */}
      <View style={styles.typeSelector}>
        <TouchableOpacity
          style={[
            styles.typeButton,
            watch("type") === "perdu" && styles.typeButtonLostActive,
          ]}
          onPress={() => setValue("type", "perdu")}
        >
          <FontAwesome
            name="search"
            size={20}
            color={watch("type") === "perdu" ? "white" : "#666"}
          />
          <Text
            style={[
              styles.typeButtonText,
              watch("type") === "perdu" && styles.typeButtonTextActive,
            ]}
          >
            Perdu
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.typeButton,
            watch("type") === "trouvé" && styles.typeButtonFoundActive,
          ]}
          onPress={() => setValue("type", "trouvé")}
        >
          <FontAwesome
            name="check"
            size={20}
            color={watch("type") === "trouvé" ? "white" : "#666"}
          />
          <Text
            style={[
              styles.typeButtonText,
              watch("type") === "trouvé" && styles.typeButtonTextActive,
            ]}
          >
            Trouvé
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.form}>
          {/* --- Titre --- */}
          <Text style={styles.label}>
            Titre <Text style={styles.required}>*</Text>
            </Text>
          <Controller
            control={control}
            name="titre"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={styles.textInput}
                value={value}
                onChangeText={onChange}
                placeholder="Titre"
              />
            )}
          />
          {errors.titre && (
            <Text style={styles.errorText}>{errors.titre.message}</Text>
          )}

          {/* --- Description --- */}
          <Text style={styles.label}>
            Description <Text style={styles.required}>*</Text>
            </Text>
          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={value}
                onChangeText={onChange}
                placeholder="Description"
                multiline
              />
            )}
          />
          {errors.description && (
            <Text style={styles.errorText}>{errors.description.message}</Text>
          )}

          {/* --- Ville --- */}
          <Text style={styles.label}>
            Ville <Text style={styles.required}>*</Text>
            </Text>
          <Controller
            control={control}
            name="ville"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={styles.textInput}
                value={value}
                onChangeText={onChange}
                placeholder="Ville"
              />
            )}
          />
          {errors.ville && (
            <Text style={styles.errorText}>{errors.ville.message}</Text>
          )}

          {/* --- Code Postal --- */}
          <Text style={styles.label}>
            Code Postal <Text style={styles.required}>*</Text>
            </Text>
          <Controller
            control={control}
            name="codePostal"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={styles.textInput}
                value={value}
                onChangeText={onChange}
                placeholder="Code postal"
              />
            )}
          />
          {errors.codePostal && (
            <Text style={styles.errorText}>{errors.codePostal.message}</Text>
          )}

          {/* --- Date --- */}
          <Text style={styles.label}>
            Date <Text style={styles.required}>*</Text>
            </Text>
            <Controller
            control={control}
            name="date"
            render={({ field: { onChange, value } }) => {
                const [open, setOpen] = useState(false);
                return (
                <>
                    <TouchableOpacity
                    style={styles.textInput}
                    onPress={() => setOpen(true)}
                    >
                    <Text>
                        {value ? new Date(value).toLocaleDateString() : "Choisir une date"}
                    </Text>
                    </TouchableOpacity>

                    <DatePicker
                    modal
                    open={open}
                    date={value ? new Date(value) : new Date()}
                    mode="date"
                    onConfirm={(date) => {
                        setOpen(false);
                        onChange(date.toISOString()); // ✅ stocke ISO string dans le form
                    }}
                    onCancel={() => setOpen(false)}
                    />
                </>
                );
            }}
            />
            {errors.date && (
            <Text style={styles.errorText}>{errors.date.message}</Text>
            )}

          {/* --- Catégorie --- */}
          <Text style={styles.label}>
            Catégorie <Text style={styles.required}>*</Text>
            </Text>
          <Controller
            control={control}
            name="categorieId"
            render={({ field: { onChange, value } }) => (
              <Picker
                selectedValue={value}
                onValueChange={onChange}
                style={styles.picker}
              >
                <Picker.Item
                  label="Sélectionner une catégorie"
                  value={0}
                />
                {categories.map((category) => (
                  <Picker.Item
                    key={category.id}
                    label={category.libelle}
                    value={category.id}
                  />
                ))}
              </Picker>
            )}
          />
          {errors.categorieId && (
            <Text style={styles.errorText}>{errors.categorieId.message}</Text>
          )}

          {/* --- Critères dynamiques --- */}
          <Text style={styles.label}>
            Critères <Text style={styles.required}>*</Text>
            </Text>
          {watch("criteres")?.map((critere, index) => (
            <Controller
              key={critere.id}
              control={control}
              name={`criteres.${index}.value`}
              render={({ field: { value, onChange } }) => (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>{critere.libelle}</Text>
                  <TextInput
                    style={styles.textInput}
                    value={value}
                    onChangeText={onChange}
                    placeholder={`Entrer ${critere.libelle}`}
                  />
                </View>
              )}
            />
          ))}

          {/* --- Question secrète --- */}
          
          {watch("type") === "trouvé" && (
            <>
            <Text style={styles.label}>
            Question Secrète <Text style={styles.required}>*</Text>
            </Text>
            <Controller
              control={control}
              name="secretQuestion"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.textInput}
                  value={value}
                  onChangeText={onChange}
                  placeholder="Ex: Quel est le nom marqué sur l'objet ?"
                />
              )}
            /></>
          )}

          {/* --- Photo --- */}
          <FormProvider {...methods}>
            <ImagePickerField control={control} />
          </FormProvider>
        </View>
      </ScrollView>

      {/* Bouton */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit(onSubmit, (errors) => {
            console.log("❌ Erreurs de validation:", errors);
            })}
          disabled={loading}
        >
         {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Mettre à jour l’annonce</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: '#f5f5f5', }, content: { flex: 1, }, header: { backgroundColor: '#007AFF', padding: 20, paddingTop: 40, }, title: { fontSize: 24, fontWeight: 'bold', color: 'white', marginBottom: 5, }, subtitle: { fontSize: 16, color: 'rgba(255, 255, 255, 0.8)', }, centeredContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', }, typeSelector: { flexDirection: 'row', padding: 20, gap: 15, }, typeButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 15, borderRadius: 10, backgroundColor: 'white', borderWidth: 2, borderColor: '#eee', gap: 8, }, typeButtonLostActive: { backgroundColor: '#FF6B6B', borderColor: '#FF6B6B', }, typeButtonFoundActive: { backgroundColor: '#4ECDC4', borderColor: '#4ECDC4', }, typeButtonText: { fontSize: 16, fontWeight: '600', color: '#666', }, typeButtonTextActive: { color: 'white', }, form: { padding: 20, }, inputGroup: { marginBottom: 20, }, label: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 8, }, required: { color: '#FF6B6B', }, textInput: { backgroundColor: 'white', borderRadius: 10, padding: 15, fontSize: 16, borderWidth: 1, borderColor: '#eee', }, textArea: { height: 100, textAlignVertical: 'top', }, row: { flexDirection: 'row', gap: 15, }, flex1: { flex: 1, }, pickerContainer: { backgroundColor: 'white', borderRadius: 10, borderWidth: 1, borderColor: '#eee', overflow: 'hidden', }, picker: { height: 50, }, hint: { fontSize: 12, color: '#666', marginTop: 5, fontStyle: 'italic', }, errorText: { color: '#FF6B6B', fontSize: 12, marginTop: 5, }, photoButton: { backgroundColor: 'white', borderRadius: 10, borderWidth: 1, borderColor: '#eee', overflow: 'hidden', }, photo: { width: '100%', height: 200, resizeMode: 'cover', }, photoPlaceholder: { height: 200, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f8f8', }, photoPlaceholderText: { marginTop: 10, fontSize: 16, color: '#999', }, footer: { padding: 20, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#eee', }, submitButton: { backgroundColor: '#007AFF', borderRadius: 10, padding: 15, alignItems: 'center', }, submitButtonDisabled: { backgroundColor: '#ccc', }, submitButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold', }, });