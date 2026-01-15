import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function TestSupabase() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [envCheck, setEnvCheck] = useState({ url: false, key: false });
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [testResults, setTestResults] = useState({});

  useEffect(() => {
    // Check environment variables
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    setEnvCheck({
      url: !!url,
      key: !!key,
      urlValue: url || 'NOT FOUND',
      keyValue: key ? `${key.substring(0, 20)}...` : 'NOT FOUND'
    });

    // Run all tests
    runAllTests();

    // Auto refresh mỗi 3 giây nếu enabled
    let interval;
    if (autoRefresh) {
      interval = setInterval(() => {
        runAllTests(false);
      }, 3000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const runAllTests = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    
    const results = {
      timestamp: new Date().toLocaleTimeString(),
      env: envCheck,
      tables: {},
      storage: {},
      rls: {}
    };

    try {
      // ============================================
      // TEST 1: CONTACT_INFO TABLE
      // ============================================
      try {
        // Thử select tất cả rows trước
        const { data: allContactData, error: allContactError } = await supabase
          .from('contact_info')
          .select('*');
        
        if (allContactError) {
          results.tables.contact_info = {
            success: false,
            error: allContactError.message,
            exists: false
          };
        } else {
          // Nếu có data, lấy row đầu tiên
          const contactData = allContactData && allContactData.length > 0 ? allContactData[0] : null;
          results.tables.contact_info = {
            success: true,
            data: contactData,
            count: allContactData?.length || 0,
            exists: true,
            hasGoogleMap: !!contactData?.google_map_url,
            fields: contactData ? Object.keys(contactData) : []
          };
        }
      } catch (error) {
        results.tables.contact_info = {
          success: false,
          error: error.message,
          exists: false
        };
      }

      // ============================================
      // TEST 2: HISTORY TABLE
      // ============================================
      try {
        const { data: historyData, error: historyError } = await supabase
          .from('history')
          .select('*')
          .order('order_index');
        
        results.tables.history = {
          success: !historyError,
          data: historyData,
          error: historyError?.message,
          count: historyData?.length || 0,
          exists: !historyError
        };
      } catch (error) {
        results.tables.history = {
          success: false,
          error: error.message,
          exists: false
        };
      }

      // ============================================
      // TEST 3: PROJECT_CATEGORIES TABLE
      // ============================================
      try {
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('project_categories')
          .select('*')
          .order('order_index');
        
        results.tables.project_categories = {
          success: !categoriesError,
          data: categoriesData,
          error: categoriesError?.message,
          count: categoriesData?.length || 0,
          exists: !categoriesError
        };
      } catch (error) {
        results.tables.project_categories = {
          success: false,
          error: error.message,
          exists: false
        };
      }

      // ============================================
      // TEST 4: PROJECTS TABLE
      // ============================================
      try {
        const { data: projectsData, error: projectsError } = await supabase
          .from('projects')
          .select('*, project_categories(*)')
          .order('order_index')
          .limit(10);
        
        const featuredCount = projectsData?.filter(p => p.is_featured)?.length || 0;
        
        results.tables.projects = {
          success: !projectsError,
          data: projectsData,
          error: projectsError?.message,
          count: projectsData?.length || 0,
          exists: !projectsError,
          featuredCount: featuredCount,
          hasFeaturedField: projectsData && projectsData.length > 0 ? 'is_featured' in projectsData[0] : false,
          hasHomeOrderField: projectsData && projectsData.length > 0 ? 'home_order' in projectsData[0] : false
        };
      } catch (error) {
        results.tables.projects = {
          success: false,
          error: error.message,
          exists: false
        };
      }

      // ============================================
      // TEST 5: DOWNLOAD_PROFILE TABLE
      // ============================================
      try {
        const { data: profileData, error: profileError } = await supabase
          .from('download_profile')
          .select('*')
          .eq('is_active', true)
          .order('order_index');
        
        results.tables.download_profile = {
          success: !profileError,
          data: profileData,
          error: profileError?.message,
          count: profileData?.length || 0,
          exists: !profileError,
          activeCount: profileData?.filter(p => p.is_active)?.length || 0
        };
      } catch (error) {
        results.tables.download_profile = {
          success: false,
          error: error.message,
          exists: false
        };
      }

      // ============================================
      // TEST 6: STORAGE BUCKETS
      // ============================================
      try {
        // Thử list buckets (có thể cần admin permissions)
        const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
        
        // Nếu listBuckets() fail, thử test trực tiếp bucket bằng cách list files
        let bucketExists = false;
        let bucketTestError = null;
        let fileCount = 0;

        try {
          // Test trực tiếp bucket bằng cách list files
          const { data: files, error: filesError } = await supabase.storage
            .from('project-images')
            .list('', { limit: 1 });
          
          if (!filesError) {
            // Nếu không có lỗi, bucket tồn tại và accessible
            bucketExists = true;
            fileCount = files?.length || 0;
          } else {
            // Nếu có lỗi, check xem là lỗi gì
            bucketTestError = filesError.message;
            // Nếu lỗi là "Bucket not found" hoặc "The resource was not found" thì bucket chưa tồn tại
            // Nếu lỗi khác (như permission) thì bucket có thể tồn tại nhưng không có quyền
            if (filesError.message?.includes('not found') || 
                filesError.message?.includes('Bucket not found') ||
                filesError.message?.includes('does not exist')) {
              bucketExists = false;
            } else {
              // Có thể bucket tồn tại nhưng có vấn đề về permissions
              bucketExists = 'unknown'; // Unknown status
            }
          }
        } catch (testError) {
          bucketTestError = testError.message;
          bucketExists = false;
        }
        
        results.storage.buckets = {
          success: !bucketsError || bucketExists === true,
          data: buckets,
          error: bucketsError?.message || bucketTestError,
          count: buckets?.length || (bucketExists === true ? 1 : 0),
          hasProjectImages: bucketExists === true || (buckets?.some(b => b.name === 'project-images') || false),
          bucketTestStatus: bucketExists === true ? 'exists' : bucketExists === false ? 'not_found' : 'unknown',
          listBucketsError: bucketsError?.message || null
        };

        // Test project-images bucket details
        if (bucketExists === true) {
          try {
            const { data: allFiles, error: allFilesError } = await supabase.storage
              .from('project-images')
              .list('', { limit: 10 });
            
            results.storage.project_images = {
              success: !allFilesError,
              fileCount: allFiles?.length || 0,
              error: allFilesError?.message,
              files: allFiles?.slice(0, 5) || []
            };
          } catch (error) {
            results.storage.project_images = {
              success: false,
              error: error.message,
              fileCount: fileCount
            };
          }
        } else if (bucketExists === 'unknown') {
          results.storage.project_images = {
            success: false,
            error: bucketTestError || 'Cannot determine bucket status - may need admin permissions',
            fileCount: 0
          };
        }
      } catch (error) {
        results.storage.buckets = {
          success: false,
          error: error.message,
          hasProjectImages: false
        };
      }

      // ============================================
      // TEST 7: RLS POLICIES (Test bằng cách thử SELECT)
      // ============================================
      results.rls = {
        contact_info_readable: results.tables.contact_info?.success || false,
        history_readable: results.tables.history?.success || false,
        projects_readable: results.tables.projects?.success || false,
        categories_readable: results.tables.project_categories?.success || false
      };

    } catch (error) {
      results.error = error.message;
    } finally {
      if (showLoading) setLoading(false);
    }

    setResult(results);
    setTestResults(results);
  };

  const refresh = () => {
    runAllTests(true);
  };

  const TestCard = ({ title, icon, success, children, error }) => (
    <div className={`p-4 rounded-lg border-2 ${success ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
      <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
        {icon} {title} {success ? '✅' : '❌'}
      </h2>
      {error && (
        <p className="text-red-600 text-sm mb-2">Error: {error}</p>
      )}
      {children}
    </div>
  );

  return (
    <div className="p-8 max-w-6xl mx-auto min-h-screen bg-gray-50">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">🔍 Supabase Connection Test</h1>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm">Auto refresh (3s)</span>
          </label>
          <button
            onClick={refresh}
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 text-sm"
          >
            🔄 Refresh Now
          </button>
        </div>
      </div>
      
      {result?.timestamp && (
        <div className="mb-4 text-sm text-gray-500 bg-white p-2 rounded">
          ⏰ Last updated: {result.timestamp}
        </div>
      )}
      
      {loading && !result ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p>Đang test kết nối...</p>
        </div>
      ) : result ? (
        <div className="space-y-6">
          {/* Environment Variables */}
          <TestCard 
            title="Environment Variables" 
            icon="🔑"
            success={envCheck.url && envCheck.key}
          >
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${envCheck.url ? 'bg-green-500' : 'bg-red-500'}`}></span>
                <span>VITE_SUPABASE_URL: {envCheck.url ? '✅ Found' : '❌ Missing'}</span>
                {envCheck.url && <span className="text-xs text-gray-500">({envCheck.urlValue})</span>}
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${envCheck.key ? 'bg-green-500' : 'bg-red-500'}`}></span>
                <span>VITE_SUPABASE_ANON_KEY: {envCheck.key ? '✅ Found' : '❌ Missing'}</span>
                {envCheck.key && <span className="text-xs text-gray-500">({envCheck.keyValue})</span>}
              </div>
            </div>
          </TestCard>

          {/* Contact Info */}
          <TestCard 
            title="Contact Info Table" 
            icon="📧"
            success={result.tables?.contact_info?.success}
            error={result.tables?.contact_info?.error}
          >
            {result.tables?.contact_info?.success ? (
              <div className="space-y-1 text-sm">
                <p><strong>Status:</strong> Table exists ✅</p>
                <p><strong>Rows:</strong> {result.tables?.contact_info?.count || 0}</p>
                {result.tables?.contact_info?.data && (
                  <>
                    <p><strong>Email:</strong> {result.tables.contact_info.data.email || 'N/A'}</p>
                    <p><strong>Hotline:</strong> {result.tables.contact_info.data.hotline || 'N/A'}</p>
                    <p><strong>Business Registration:</strong> {result.tables.contact_info.data.business_registration_address || 'N/A'}</p>
                    <p><strong>Office:</strong> {result.tables.contact_info.data.office_address || 'N/A'}</p>
                    <p><strong>Google Map URL:</strong> {result.tables.contact_info.data.google_map_url ? (
                      <a href={result.tables.contact_info.data.google_map_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {result.tables.contact_info.data.google_map_url}
                      </a>
                    ) : '❌ N/A (Chưa chạy SQL script)'}</p>
                    <p><strong>Fields:</strong> {result.tables.contact_info.fields?.join(', ') || 'N/A'}</p>
                    <p><strong>Updated At:</strong> {result.tables.contact_info.data.updated_at || 'N/A'}</p>
                  </>
                )}
              </div>
            ) : (
              <div className="text-sm">
                <p className="text-red-600">Table không tồn tại hoặc có lỗi</p>
                <p className="text-xs text-gray-500 mt-2">Cần chạy script: supabase-setup.sql</p>
              </div>
            )}
          </TestCard>

          {/* History */}
          <TestCard 
            title="History Table" 
            icon="📅"
            success={result.tables?.history?.success}
            error={result.tables?.history?.error}
          >
            {result.tables?.history?.success ? (
              <div className="text-sm">
                <p><strong>Status:</strong> Table exists ✅</p>
                <p><strong>Count:</strong> {result.tables.history.count} items</p>
                {result.tables.history.data && result.tables.history.data.length > 0 && (
                  <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
                    {result.tables.history.data.slice(0, 5).map((item, idx) => (
                      <p key={idx} className="text-xs">- {item.year}: {item.title}</p>
                    ))}
                    {result.tables.history.data.length > 5 && <p className="text-xs">... và {result.tables.history.data.length - 5} items khác</p>}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-red-600">Table không tồn tại</p>
            )}
          </TestCard>

          {/* Project Categories */}
          <TestCard 
            title="Project Categories Table" 
            icon="📁"
            success={result.tables?.project_categories?.success}
            error={result.tables?.project_categories?.error}
          >
            {result.tables?.project_categories?.success ? (
              <div className="text-sm">
                <p><strong>Status:</strong> Table exists ✅</p>
                <p><strong>Count:</strong> {result.tables.project_categories.count} categories</p>
                {result.tables.project_categories.data && result.tables.project_categories.data.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {result.tables.project_categories.data.map((cat) => (
                      <span key={cat.id} className="px-2 py-1 bg-white rounded text-xs">
                        {cat.name} ({cat.slug})
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-red-600">Table không tồn tại</p>
            )}
          </TestCard>

          {/* Projects */}
          <TestCard 
            title="Projects Table" 
            icon="🎨"
            success={result.tables?.projects?.success}
            error={result.tables?.projects?.error}
          >
            {result.tables?.projects?.success ? (
              <div className="text-sm space-y-2">
                <p><strong>Status:</strong> Table exists ✅</p>
                <p><strong>Count:</strong> {result.tables.projects.count} projects (showing first 10)</p>
                <p><strong>Featured Projects:</strong> {result.tables.projects.featuredCount}/4</p>
                <p><strong>Has is_featured field:</strong> {result.tables.projects.hasFeaturedField ? '✅ Yes' : '❌ No (Cần chạy supabase-featured-projects.sql)'}</p>
                <p><strong>Has home_order field:</strong> {result.tables.projects.hasHomeOrderField ? '✅ Yes' : '❌ No (Cần chạy supabase-featured-projects.sql)'}</p>
                {result.tables.projects.data && result.tables.projects.data.length > 0 && (
                  <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
                    {result.tables.projects.data.slice(0, 5).map((project, idx) => (
                      <div key={idx} className="text-xs p-2 bg-white rounded">
                        <p><strong>{project.title || 'Untitled'}</strong></p>
                        <p className="text-gray-500">
                          Category: {project.project_categories?.name || 'N/A'} | 
                          Featured: {project.is_featured ? '✅' : '❌'} | 
                          Layout: {project.layout || 'N/A'}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-red-600">Table không tồn tại</p>
            )}
          </TestCard>

          {/* Download Profile */}
          <TestCard 
            title="Download Profile Table" 
            icon="📥"
            success={result.tables?.download_profile?.success}
            error={result.tables?.download_profile?.error}
          >
            {result.tables?.download_profile?.success ? (
              <div className="text-sm">
                <p><strong>Status:</strong> Table exists ✅</p>
                <p><strong>Total:</strong> {result.tables.download_profile.count} profiles</p>
                <p><strong>Active:</strong> {result.tables.download_profile.activeCount} profiles</p>
                {result.tables.download_profile.data && result.tables.download_profile.data.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {result.tables.download_profile.data.map((profile, idx) => (
                      <p key={idx} className="text-xs">
                        - {profile.title}: {profile.file_url ? '✅ Has file' : '❌ No file'} ({profile.is_active ? 'Active' : 'Inactive'})
                      </p>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-red-600">Table không tồn tại (Cần chạy supabase-admin-setup.sql)</p>
            )}
          </TestCard>

          {/* Storage */}
          <TestCard 
            title="Storage Buckets" 
            icon="📦"
            success={result.storage?.buckets?.hasProjectImages === true}
            error={result.storage?.buckets?.error}
          >
            <div className="text-sm space-y-2">
              {result.storage?.buckets?.listBucketsError && (
                <div className="bg-yellow-50 p-2 rounded text-xs mb-2">
                  <p className="text-yellow-800"><strong>Note:</strong> listBuckets() failed: {result.storage.buckets.listBucketsError}</p>
                  <p className="text-yellow-700">(This is normal - using direct bucket test instead)</p>
                </div>
              )}
              
              {result.storage?.buckets?.bucketTestStatus === 'exists' ? (
                <>
                  <p><strong>Status:</strong> Storage accessible ✅</p>
                  <p><strong>project-images bucket:</strong> ✅ <strong>EXISTS</strong> (Bucket đã được tạo và có thể truy cập)</p>
                  {result.storage?.project_images && (
                    <>
                      <p><strong>Files in bucket:</strong> {result.storage.project_images.fileCount || 0}</p>
                      {result.storage.project_images.error && (
                        <p className="text-yellow-600 text-xs">⚠️ {result.storage.project_images.error}</p>
                      )}
                    </>
                  )}
                </>
              ) : result.storage?.buckets?.bucketTestStatus === 'not_found' ? (
                <>
                  <p><strong>Status:</strong> ❌ Bucket not found</p>
                  <p><strong>project-images bucket:</strong> ❌ <strong>NOT FOUND</strong></p>
                  <div className="bg-red-50 p-2 rounded text-xs mt-2">
                    <p className="text-red-800"><strong>Cần làm:</strong></p>
                    <ol className="list-decimal list-inside space-y-1 text-red-700">
                      <li>Vào Supabase Dashboard → Storage</li>
                      <li>Click "+ New bucket"</li>
                      <li>Tên: <code className="bg-white px-1 rounded">project-images</code></li>
                      <li>Public bucket: ✅ BẬT</li>
                      <li>Click "Create bucket"</li>
                    </ol>
                  </div>
                  {result.storage?.buckets?.error && (
                    <p className="text-xs text-gray-600 mt-2">Error: {result.storage.buckets.error}</p>
                  )}
                </>
              ) : result.storage?.buckets?.bucketTestStatus === 'unknown' ? (
                <>
                  <p><strong>Status:</strong> ⚠️ Unknown (có thể do permissions)</p>
                  <p><strong>project-images bucket:</strong> ⚠️ Cannot determine</p>
                  <div className="bg-yellow-50 p-2 rounded text-xs mt-2">
                    <p className="text-yellow-800">Có thể bucket đã được tạo nhưng cần kiểm tra:</p>
                    <ul className="list-disc list-inside space-y-1 text-yellow-700">
                      <li>Bucket có tồn tại trong Supabase Dashboard không?</li>
                      <li>Bucket có được set là Public không?</li>
                      <li>RLS policies đã được tạo chưa? (Chạy supabase-storage-setup.sql)</li>
                    </ul>
                  </div>
                  {result.storage?.buckets?.error && (
                    <p className="text-xs text-gray-600 mt-2">Error: {result.storage.buckets.error}</p>
                  )}
                </>
              ) : (
                <p className="text-sm text-red-600">Không thể test Storage - {result.storage?.buckets?.error || 'Unknown error'}</p>
              )}
            </div>
          </TestCard>

          {/* RLS Policies Summary */}
          <div className="p-4 rounded-lg border-2 border-blue-500 bg-blue-50">
            <h2 className="text-xl font-bold mb-2">🔒 RLS Policies Status</h2>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${result.rls?.contact_info_readable ? 'bg-green-500' : 'bg-red-500'}`}></span>
                <span>contact_info: {result.rls?.contact_info_readable ? 'Readable ✅' : 'Not readable ❌'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${result.rls?.history_readable ? 'bg-green-500' : 'bg-red-500'}`}></span>
                <span>history: {result.rls?.history_readable ? 'Readable ✅' : 'Not readable ❌'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${result.rls?.projects_readable ? 'bg-green-500' : 'bg-red-500'}`}></span>
                <span>projects: {result.rls?.projects_readable ? 'Readable ✅' : 'Not readable ❌'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${result.rls?.categories_readable ? 'bg-green-500' : 'bg-red-500'}`}></span>
                <span>categories: {result.rls?.categories_readable ? 'Readable ✅' : 'Not readable ❌'}</span>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="p-4 rounded-lg border-2 border-gray-300 bg-white">
            <h2 className="text-xl font-bold mb-2">📊 Summary</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="font-bold">Tables</p>
                <p className="text-2xl">
                  {[
                    result.tables?.contact_info?.success,
                    result.tables?.history?.success,
                    result.tables?.project_categories?.success,
                    result.tables?.projects?.success,
                    result.tables?.download_profile?.success
                  ].filter(Boolean).length}/5
                </p>
              </div>
              <div>
                <p className="font-bold">Storage</p>
                <p className="text-2xl">
                  {result.storage?.buckets?.success ? '✅' : '❌'}
                </p>
              </div>
              <div>
                <p className="font-bold">RLS Policies</p>
                <p className="text-2xl">
                  {Object.values(result.rls || {}).filter(Boolean).length}/{Object.keys(result.rls || {}).length}
                </p>
              </div>
              <div>
                <p className="font-bold">Overall</p>
                <p className="text-2xl">
                  {[
                    result.tables?.contact_info?.success,
                    result.tables?.history?.success,
                    result.tables?.projects?.success,
                    result.storage?.buckets?.success
                  ].filter(Boolean).length >= 3 ? '✅' : '⚠️'}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <p>No result</p>
      )}
    </div>
  );
}
