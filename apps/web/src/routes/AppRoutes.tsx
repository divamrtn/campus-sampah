import { Navigate, Route, Routes } from "react-router-dom";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import AdminLayout from "../layouts/AdminLayout";
import ProtectedRoute from "../components/ProtectedRoute";
import Dashboard from "../pages/admin/Dashboard";
import DataSampah from "../pages/admin/DataSampah";
import InputDataSampah from "../pages/admin/InputDataSampah";
import BankSampah from "../pages/admin/BankSampah";
import LokasiTps from "../pages/admin/LokasiTps";
import Pengangkutan from "../pages/admin/Pengangkutan";
import Jadwal from "../pages/admin/Jadwal";
import DaurUlang from "../pages/admin/DaurUlang";
import Petugas from "../pages/admin/Petugas";
import Laporan from "../pages/admin/Laporan";
import Pengaturan from "../pages/admin/Pengaturan";
import MahasiswaLayout from "../pages/mahasiswa/MahasiswaLayout";
import DashboardMahasiswa from "../pages/mahasiswa/DashboardMahasiswa";
import SetorSampah from "../pages/mahasiswa/SetorSampah";
import RiwayatSetoran from "../pages/mahasiswa/RiwayatSetoran";
import PetugasLayout from "../pages/petugas/PetugasLayout";
import DashboardPetugas from "../pages/petugas/DashboardPetugas";
import VerifikasiSetoran from "../pages/petugas/VerifikasiSetoran";
import DataSampahPetugas from "../pages/petugas/DataSampahPetugas";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Area admin */}
      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />

          {/* Data sampah. key memaksa tabel di-reset saat pindah menu */}
          <Route path="sampah" element={<DataSampah key="semua" />} />
          <Route path="sampah/tambah" element={<InputDataSampah />} />
          <Route
            path="sampah/verifikasi"
            element={<DataSampah key="verifikasi" status="Menunggu" />}
          />

          {/* Kategori sampah */}
          <Route path="kategori/organik" element={<DataSampah key="organik" kategori="Organik" />} />
          <Route
            path="kategori/anorganik"
            element={<DataSampah key="anorganik" kategori="Anorganik" />}
          />
          <Route path="kategori/b3" element={<DataSampah key="b3" kategori="B3" />} />

          <Route path="bank-sampah" element={<BankSampah />} />
          <Route path="tps" element={<LokasiTps />} />

          {/* Operasional */}
          <Route path="pengangkutan" element={<Pengangkutan />} />
          <Route path="jadwal" element={<Jadwal />} />
          <Route path="daur-ulang" element={<DaurUlang />} />
          <Route path="petugas" element={<Petugas />} />

          {/* Sistem */}
          <Route path="laporan" element={<Laporan />} />
          <Route path="pengaturan" element={<Pengaturan />} />

          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Route>
      </Route>

      {/* Area petugas */}
      <Route element={<ProtectedRoute allowedRoles={["petugas"]} />}>
        <Route path="/petugas" element={<PetugasLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPetugas />} />
          <Route path="verifikasi" element={<VerifikasiSetoran />} />
          <Route path="data" element={<DataSampahPetugas />} />
          <Route path="*" element={<Navigate to="/petugas/dashboard" replace />} />
        </Route>
      </Route>

      {/* Area mahasiswa */}
      <Route element={<ProtectedRoute allowedRoles={["mahasiswa"]} />}>
        <Route path="/mahasiswa" element={<MahasiswaLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardMahasiswa />} />
          <Route path="setor" element={<SetorSampah />} />
          <Route path="riwayat" element={<RiwayatSetoran />} />
          <Route path="*" element={<Navigate to="/mahasiswa/dashboard" replace />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;