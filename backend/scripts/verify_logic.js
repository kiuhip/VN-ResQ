const text = "cháy ở số 55 đường Trần duy hưng";
const lowerText = text.toLowerCase();

const removeAccents = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D");
const normalizedText = removeAccents(lowerText);

console.log("Original:", text);
console.log("Lower:", lowerText);
console.log("Normalized:", normalizedText);
console.log("Target:", 'tran duy hung');

if (normalizedText.includes('tran duy hung')) {
    console.log("✅ MATCHED!");
} else {
    console.log("❌ FAILED!");
}
