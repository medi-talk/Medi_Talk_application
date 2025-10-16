// BoardWriteScreen.tsx
import React, { useState, useEffect, useMemo } from "react";
import {
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ScrollView,
  View,
} from "react-native";
import { Picker } from '@react-native-picker/picker';
import { COLORS, FONTS, SIZES } from "./styles/theme";
import { useAppStore } from "./store/appStore";
import api from "./utils/api";


type CategoryData = {
  categoryId: number;
  categoryName: string;
};


export default function BoardWriteScreen({ navigation }: any) {
  const { state } = useAppStore();
  const userId = state.user?.id;

  // 카테고리
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("__");

  // 입력 상태
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // 카테고리 목록 API 호출
  useEffect(() => {
    (async () => {
      try {
        setCategoriesLoading(true);

        const res = await api.get("/api/board/listBoardCategories");

        if (res.data.success) {
          const raw = Array.isArray(res.data?.categories) ? res.data.categories : [];

          const mapped: CategoryData[] = raw.map((c: any) => {
            const id = Number(c.categoryId);
            let name = (c?.categoryName ?? "").toString().trim();

            return { categoryId: id, categoryName: name };
          });

          const cleaned = mapped.filter(
            (c) => 
              Number.isFinite(c.categoryId) && 
              c.categoryId > 0 && 
              c.categoryName.length > 0
          );

          const unique = Array.from(
            new Map(cleaned.map((c) => [c.categoryId, c])).values()
          );

          setCategories(unique);
          if (unique.length > 0) {
            setSelectedCategoryId(String(unique[0].categoryId));
          } else {
            setSelectedCategoryId("__");
          }

        } else {
          setCategories([]);
          setSelectedCategoryId("__");
        }

      } catch (err : any) {
        console.error("❌ load categories error:", err);

        const status = err?.response?.status;
        const message = err?.response?.data?.message;

        if (status == 500) {
          Alert.alert('서버 오류', message);
        } else {
          Alert.alert('네트워크 오류', '서버에 연결할 수 없습니다.');
        }

      } finally {
        setCategoriesLoading(false);
      }
    })();
  }, []);


  const handleSubmit = async () => {

    if (!title.trim() || !content.trim() || selectedCategoryId === "__") {
      Alert.alert("입력 오류", "모든 항목을 입력해주세요.");
      return;
    }

    const boardPost = {
      categoryId: Number(selectedCategoryId),
      title: title.trim(),
      content: content.trim(),
    }

    try {
      const res = await api.post(`/api/board/createBoardPost/${userId}`, { boardPost });

      if (!res.data.success) {
        Alert.alert("오류", res.data.message || "게시글 작성에 실패했습니다.");
        return;
      } 

      Alert.alert("작성 완료", "게시글이 등록되었습니다.");
      navigation.goBack();
    } catch (err : any) {
      console.error("❌ create post error:", err);

      const status = err?.response?.status;
      const message = err?.response?.data?.message;

      if (status == 500) {
        Alert.alert('서버 오류', message);
      } else {
        Alert.alert('네트워크 오류', '서버에 연결할 수 없습니다.');
      }
    }
  };

  const pickerItems = useMemo(
    () => (categories || [])
      .filter((c) => !!c)
      .filter(
        (c) => 
          Number.isFinite(c.categoryId) &&
          c.categoryId > 0 &&
          String(c.categoryName).trim().length > 0
      )
      .reduce<CategoryData[]>((acc, cur) => {
        if (!acc.some((x) => x.categoryId === cur.categoryId)) acc.push(cur);
        return acc;
      }, []),
    [categories]
  );

  const validSelection = useMemo(
    () => pickerItems.some((c) => String(c.categoryId) === selectedCategoryId),
    [pickerItems, selectedCategoryId]
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>게시글 작성</Text>

        {/* 카테고리 선택 */}
        <Text style={styles.label}>카테고리</Text>
        <View style={styles.pickerBox}>
          {categoriesLoading ? (
            <View style={[styles.picker, { justifyContent: "center" }]}>
              <Text style={{ color: COLORS.gray }}>불러오는 중...</Text>
            </View>
          ) : pickerItems.length === 0 ? (
            <View style={[styles.picker, { justifyContent: "center" }]}>
              <Text style={{ color: COLORS.gray }}>등록된 카테고리가 없습니다</Text>
            </View>
          ) : !validSelection ? (
            <View style={[styles.picker, { justifyContent: "center" }]}>
              <Text style={{ color: COLORS.gray }}>카테고리 준비 중...</Text>
            </View>
          ) : (
            <Picker
              key={pickerItems.length}
              selectedValue={selectedCategoryId}
              onValueChange={(val) => {
                const newVal = String(val);
                if (newVal !== selectedCategoryId) {
                  setTimeout(() => setSelectedCategoryId(newVal), 0);
                }
              }}
              mode="dropdown"
              prompt="카테고리를 선택하세요"
              style={[styles.picker, { color: COLORS.darkGray }]}
              dropdownIconColor={COLORS.primary}
            >
              {pickerItems.map((c) => (
                <Picker.Item
                  key={String(c.categoryId)}
                  label={String(c.categoryName)}
                  value={String(c.categoryId)}
                />
              ))}
            </Picker>
          )}
        </View>

        {/* 제목 입력 */}
        <Text style={styles.label}>제목</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          style={styles.input}
          placeholder="제목을 입력하세요"
          placeholderTextColor={COLORS.gray}
        />

        {/* 내용 입력 */}
        <Text style={styles.label}>내용</Text>
        <TextInput
          value={content}
          onChangeText={setContent}
          style={[styles.input, styles.textarea]}
          placeholder="내용을 입력하세요"
          placeholderTextColor={COLORS.gray}
          multiline
        />

        {/* 작성 버튼 */}
        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
          <Text style={styles.submitText}>작성 완료</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  container: {
    padding: SIZES.padding,
  },
  header: {
    ...FONTS.h2,
    color: COLORS.primary,
    textAlign: "center",
    marginBottom: 20,
  },
  label: {
    ...FONTS.h4,
    color: COLORS.darkGray,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderRadius: SIZES.radius,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 15,
    ...FONTS.p,
    color: COLORS.darkGray,
  },
  textarea: {
    height: 120,
    textAlignVertical: "top",
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius,
    paddingVertical: 12,
    marginTop: 10,
  },
  submitText: {
    ...FONTS.h3,
    color: COLORS.white,
    textAlign: "center",
  },
  pickerBox: {
    backgroundColor: COLORS.lightGray,
    borderRadius: SIZES.radius,
    marginBottom: 12,
  },
  picker: { height: 50, width: "100%" },
});
