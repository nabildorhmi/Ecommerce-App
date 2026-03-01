<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Products table indexes
        Schema::table('products', function (Blueprint $table) {
            // Single column indexes for filtering
            $this->addIndexIfNotExists('products', 'products_is_active_index', function () use ($table) {
                $table->index('is_active');
            });
            $this->addIndexIfNotExists('products', 'products_is_featured_index', function () use ($table) {
                $table->index('is_featured');
            });
            $this->addIndexIfNotExists('products', 'products_is_new_index', function () use ($table) {
                $table->index('is_new');
            });

            // Composite index for active products sorted by date (common query pattern)
            $this->addIndexIfNotExists('products', 'products_is_active_created_at_index', function () use ($table) {
                $table->index(['is_active', 'created_at']);
            });

            // Foreign key index (may already exist from FK constraint)
            $this->addIndexIfNotExists('products', 'products_category_id_index', function () use ($table) {
                $table->index('category_id');
            });
        });

        // Variants table indexes
        Schema::table('variants', function (Blueprint $table) {
            // Foreign key index
            $this->addIndexIfNotExists('variants', 'variants_product_id_index', function () use ($table) {
                $table->index('product_id');
            });

            // Single column index for default variant lookup
            $this->addIndexIfNotExists('variants', 'variants_is_default_index', function () use ($table) {
                $table->index('is_default');
            });

            // Composite index for active variants per product (common filtering)
            $this->addIndexIfNotExists('variants', 'variants_product_id_is_active_index', function () use ($table) {
                $table->index(['product_id', 'is_active']);
            });
        });

        // Orders table indexes
        Schema::table('orders', function (Blueprint $table) {
            // Foreign key index for user order history
            $this->addIndexIfNotExists('orders', 'orders_user_id_index', function () use ($table) {
                $table->index('user_id');
            });

            // Single column index for admin filtering by city
            $this->addIndexIfNotExists('orders', 'orders_city_index', function () use ($table) {
                $table->index('city');
            });
        });

        // Order items table indexes
        Schema::table('order_items', function (Blueprint $table) {
            // Foreign key indexes
            $this->addIndexIfNotExists('order_items', 'order_items_order_id_index', function () use ($table) {
                $table->index('order_id');
            });
            $this->addIndexIfNotExists('order_items', 'order_items_product_id_index', function () use ($table) {
                $table->index('product_id');
            });
            $this->addIndexIfNotExists('order_items', 'order_items_variant_id_index', function () use ($table) {
                $table->index('variant_id');
            });
        });

        // Order status logs table indexes
        Schema::table('order_status_logs', function (Blueprint $table) {
            // Foreign key index for log lookup
            $this->addIndexIfNotExists('order_status_logs', 'order_status_logs_order_id_index', function () use ($table) {
                $table->index('order_id');
            });

            // Single column index for audit queries by actor
            $this->addIndexIfNotExists('order_status_logs', 'order_status_logs_actor_id_index', function () use ($table) {
                $table->index('actor_id');
            });
        });

        // Categories table indexes (if is_active column exists)
        if (Schema::hasColumn('categories', 'is_active')) {
            Schema::table('categories', function (Blueprint $table) {
                $this->addIndexIfNotExists('categories', 'categories_is_active_index', function () use ($table) {
                    $table->index('is_active');
                });
            });
        }

        // Hero banners table indexes (if table exists)
        if (Schema::hasTable('hero_banners')) {
            Schema::table('hero_banners', function (Blueprint $table) {
                if (Schema::hasColumn('hero_banners', 'is_active')) {
                    $this->addIndexIfNotExists('hero_banners', 'hero_banners_is_active_index', function () use ($table) {
                        $table->index('is_active');
                    });
                }
                if (Schema::hasColumn('hero_banners', 'sort_order')) {
                    $this->addIndexIfNotExists('hero_banners', 'hero_banners_sort_order_index', function () use ($table) {
                        $table->index('sort_order');
                    });
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Products table
        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex('products_is_active_index');
            $table->dropIndex('products_is_featured_index');
            $table->dropIndex('products_is_new_index');
            $table->dropIndex('products_is_active_created_at_index');
            // Only drop if we created it (not from FK)
            if ($this->indexExists('products', 'products_category_id_index')) {
                $table->dropIndex('products_category_id_index');
            }
        });

        // Variants table
        Schema::table('variants', function (Blueprint $table) {
            $table->dropIndex('variants_product_id_index');
            $table->dropIndex('variants_is_default_index');
            $table->dropIndex('variants_product_id_is_active_index');
        });

        // Orders table
        Schema::table('orders', function (Blueprint $table) {
            $table->dropIndex('orders_user_id_index');
            $table->dropIndex('orders_city_index');
        });

        // Order items table
        Schema::table('order_items', function (Blueprint $table) {
            $table->dropIndex('order_items_order_id_index');
            $table->dropIndex('order_items_product_id_index');
            $table->dropIndex('order_items_variant_id_index');
        });

        // Order status logs table
        Schema::table('order_status_logs', function (Blueprint $table) {
            $table->dropIndex('order_status_logs_order_id_index');
            $table->dropIndex('order_status_logs_actor_id_index');
        });

        // Categories table
        if (Schema::hasColumn('categories', 'is_active')) {
            Schema::table('categories', function (Blueprint $table) {
                if ($this->indexExists('categories', 'categories_is_active_index')) {
                    $table->dropIndex('categories_is_active_index');
                }
            });
        }

        // Hero banners table
        if (Schema::hasTable('hero_banners')) {
            Schema::table('hero_banners', function (Blueprint $table) {
                if ($this->indexExists('hero_banners', 'hero_banners_is_active_index')) {
                    $table->dropIndex('hero_banners_is_active_index');
                }
                if ($this->indexExists('hero_banners', 'hero_banners_sort_order_index')) {
                    $table->dropIndex('hero_banners_sort_order_index');
                }
            });
        }
    }

    /**
     * Add index only if it doesn't already exist
     */
    private function addIndexIfNotExists(string $table, string $indexName, callable $callback): void
    {
        if (!$this->indexExists($table, $indexName)) {
            $callback();
        }
    }

    /**
     * Check if an index exists on a table
     */
    private function indexExists(string $table, string $indexName): bool
    {
        $indexes = DB::select("SHOW INDEX FROM {$table} WHERE Key_name = ?", [$indexName]);
        return !empty($indexes);
    }
};
