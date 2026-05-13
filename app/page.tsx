'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';

const specialOptions = [
  'BPA Free',
  'Greenguard Certified',
  'Vegan',
  'Cruelty Free',
  'Non Toxic',
  'Organic',
  'FSC Certified'
];

const priceTiers = [
  'Saver',
  'Standard',
  'Baller'
];

const priceTierKey =
  'cheaperfind:priceTier';

function compressImage(
  file: File
): Promise<string> {
  return new Promise(
    (resolve, reject) => {
      const img = new Image();
      const reader =
        new FileReader();

      reader.onload = () => {
        img.onload = () => {
          const max = 900;

          const scale = Math.min(
            1,
            max /
              Math.max(
                img.width,
                img.height
              )
          );

          const canvas =
            document.createElement(
              'canvas'
            );

          canvas.width =
            Math.round(
              img.width * scale
            );

          canvas.height =
            Math.round(
              img.height * scale
            );

          const ctx =
            canvas.getContext(
              '2d'
            );

          if (!ctx) {
            return reject(
              new Error(
                'Canvas not supported'
              )
            );
          }

          ctx.drawImage(
            img,
            0,
            0,
            canvas.width,
            canvas.height
          );

          resolve(
            canvas.toDataURL(
              'image/jpeg',
              0.82
            )
          );
        };

        img.onerror = reject;

        img.src = String(
          reader.result
        );
      };

      reader.onerror = reject;

      reader.readAsDataURL(file);
    }
  );
}

export default function Home() {
  const [description, setDescription] =
    useState('');

  const [url, setUrl] =
    useState('');

  const [imageData, setImageData] =
    useState<string>('');

  const [filtersOpen, setFiltersOpen] =
    useState(false);

  const [
    specialFilters,
    setSpecialFilters
  ] = useState<string[]>([]);

  const [priceTier, setPriceTier] =
    useState('Standard');

  const [loading, setLoading] =
    useState(false);

  const [profileName, setProfileName] =
    useState('');

  const [
    profileEmail,
    setProfileEmail
  ] = useState('');

  const [
    profilePhone,
    setProfilePhone
  ] = useState('');

  const [
    profileImage,
    setProfileImage
  ] = useState('');

  const [showEmail, setShowEmail] =
    useState(false);

  const [showPhone, setShowPhone] =
    useState(false);

  const router = useRouter();

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user }
      } =
        await supabase.auth.getUser();

      if (!user) {
        router.replace(
          '/onboarding'
        );

        return;
      }

      localStorage.setItem(
        'cheaperfind:onboardingComplete',
        'true'
      );

      const saved =
        localStorage.getItem(
          priceTierKey
        );

      if (
        saved &&
        priceTiers.includes(saved)
      ) {
        setPriceTier(saved);
      }

      const { data: profile } =
        await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

      if (!profile) return;

      setProfileName(
        profile.full_name || ''
      );

      setProfileEmail(
        profile.email || ''
      );

      setProfilePhone(
        profile.phone || ''
      );

      setProfileImage(
        profile.profile_image ||
          profile.avatar_url ||
          ''
      );

      setShowEmail(
        profile.show_email ??
          false
      );

      setShowPhone(
        profile.show_phone ??
          false
      );
    }

    loadProfile();
  }, [router]);

  function toggleSpecial(
    name: string
  ) {
    setSpecialFilters(
      (current) =>
        current.includes(name)
          ? current.filter(
              (x) => x !== name
            )
          : [...current, name]
    );
  }

  async function onFile(
    file?: File
  ) {
    if (!file) return;

    const compressed =
      await compressImage(file);

    setImageData(compressed);
  }

  async function search() {
    setLoading(true);

    try {
      const res = await fetch(
        '/api/search',
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json'
          },

          body: JSON.stringify({
            description:
              description.trim(),

            url: url.trim(),

            imageData,

            specialFilters,

            priceTier
          })
        }
      );

      const data =
        await res.json();

      localStorage.setItem(
        'cheaperfind:lastResults',
        JSON.stringify(data)
      );

      router.push('/results');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className='shopHome'>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          marginBottom: 24
        }}
      >
        {profileImage && (
          <img
            src={profileImage}
            alt='profile'
            style={{
              width: 56,
              height: 56,
              borderRadius:
                '999px',
              objectFit: 'cover'
            }}
          />
        )}

        <div>
          <div
            style={{
              height: 8
            }}
          />

          <div
            style={{
              opacity: 0.7,
              fontSize: 14
            }}
          >
            {showEmail
              ? profileEmail
              : ''}
          </div>

          <div
            style={{
              opacity: 0.7,
              fontSize: 14
            }}
          >
            {showPhone
              ? profilePhone
              : ''}
          </div>
        </div>
      </div>

      <h1
        style={{
          width: '100%',
          textAlign: 'left',
          marginBottom: 10
        }}
      >
        Shop
      </h1>

      <div className='card searchBox shopCard'>
        <input
          className='input'
          placeholder='Describe product'
          value={description}
          onChange={(e) =>
            setDescription(
              e.target.value
            )
          }
        />

        <input
          className='input'
          placeholder='Paste product link'
          value={url}
          onChange={(e) =>
            setUrl(
              e.target.value
            )
          }
        />

        <button
          type='button'
          className='button secondary'
          onClick={() =>
            setFiltersOpen(
              (v) => !v
            )
          }
        >
          ☰ Filters
        </button>

        {filtersOpen && (
          <div className='filterPanel'>
            <details
              className='filterDrop'
              open
            >
              <summary>
                Price
              </summary>

              <div className='tierOptions'>
                {priceTiers.map(
                  (t) => (
                    <button
                      key={t}
                      type='button'
                      className={
                        priceTier ===
                        t
                          ? 'tierButton active'
                          : 'tierButton'
                      }
                      onClick={() =>
                        setPriceTier(
                          t
                        )
                      }
                    >
                      {t}
                    </button>
                  )
                )}
              </div>
            </details>

            <details className='filterDrop'>
              <summary>
                Special filters
              </summary>

              <div className='filterRow'>
                {specialOptions.map(
                  (name) => (
                    <button
                      type='button'
                      key={name}
                      className={
                        specialFilters.includes(
                          name
                        )
                          ? 'filter active greenFilter'
                          : 'filter'
                      }
                      onClick={() =>
                        toggleSpecial(
                          name
                        )
                      }
                    >
                      {name}
                    </button>
                  )
                )}
              </div>
            </details>
          </div>
        )}

        <label className='uploadBox'>
          <input
            type='file'
            accept='image/*'
            onChange={(e) =>
              onFile(
                e.target.files?.[0]
              )
            }
          />

          <span>
            {imageData
              ? 'Photo ready'
              : 'Upload photo'}
          </span>
        </label>

        {imageData && (
          <img
            src={imageData}
            alt='preview'
            className='preview'
          />
        )}

        <button
          className='button'
          onClick={search}
          disabled={
            loading ||
            (!description &&
              !url &&
              !imageData)
          }
        >
          {loading
            ? 'Searching...'
            : 'Search'}
        </button>
      </div>
    </section>
  );
}
