# Baza zaxirasi va tiklash

`.github/workflows/db-backup.yml` har kuni 02:00 da (Toshkent) `public`, `private` va `auth` sxemalarining nusxasini oladi,
toza bazaga tiklab sinaydi, AES-256 bilan shifrlaydi va GitHub Actions'da 30 kun saqlaydi. Ish xato bilan tugasa, GitHub email yuboradi.

`.github/workflows/files-backup.yml` har kuni 02:30 da `docs`, `logos` va `videos` bucket'larini shifrlab saqlaydi.
Ochish: `gpg --output files.tar.gz --decrypt investage-files.tar.gz.gpg`, keyin `tar -xzf files.tar.gz`.

**Nusxaga kirmaydi:** Vault maxfiy qiymatlari, Edge Function'lar.

## Tiklash

1. GitHub → Actions → "Baza zaxirasi" → kerakli ish → Artifacts'dan faylni yuklab oling.
2. Shifrni oching (parol: `BACKUP_PASSPHRASE`):

   ```bash
   gpg --output db.dump --decrypt investage-db.dump.gpg
   ```

3. Avval bo'sh loyihaga yoki alohida bazaga tiklab tekshiring. Ishlab turgan bazani ustidan yozmang:

   ```bash
   pg_restore --dbname "<ulanish manzili>" --no-owner --no-privileges db.dump
   ```

4. Ish tugagach `db.dump` faylini o'chiring: unda parol xeshlari va ikki bosqichli kirish kalitlari bor.

`BACKUP_PASSPHRASE` yo'qolsa, nusxalarni ochib bo'lmaydi. U faqat GitHub Secrets'da va parol menejeringizda turadi.
