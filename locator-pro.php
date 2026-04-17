<?php
/**
 * Plugin Name:       Locator Pro (React Edition)
 * Description:       A high-end store locator built with React, Leaflet, and WP REST API.
 * Version:           1.0.0
 * Author:            Eleni Stavridou
 * Text Domain:       locator-pro
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

function lp_register_location_cpt() {
    $labels = array(
        'name'               => _x( 'Locations', 'post type general name', 'locator-pro' ),
        'singular_name'      => _x( 'Location', 'post type singular name', 'locator-pro' ),
        'menu_name'          => _x( 'Locations', 'admin menu', 'locator-pro' ),
        'add_new'            => _x( 'Add New', 'location', 'locator-pro' ),
        'add_new_item'       => __( 'Add New Location', 'locator-pro' ),
        'edit_item'          => __( 'Edit Location', 'locator-pro' ),
        'all_items'          => __( 'All Locations', 'locator-pro' ),
    );

    $args = array(
        'labels'             => $labels,
        'public'             => true,
        'has_archive'        => false,
        'publicly_queryable' => false, // Removes "View Post" and frontend access
        'show_in_rest'       => true, // Required for Gutenberg and REST API access
        'supports'           => array( 'title', 'editor', 'thumbnail', 'excerpt' ),
        'menu_icon'          => 'dashicons-location-alt',
        'rewrite'            => array( 'slug' => 'locations' ),
    );

    register_post_type( 'location', $args );
}
add_action( 'init', 'lp_register_location_cpt' );

/**
 * Add Meta Box to Location CPT
 */
function lp_add_location_meta_boxes() {
    add_meta_box(
        'lp_location_details',
        __( 'Location Details', 'locator-pro' ),
        'lp_location_meta_box_html',
        'location',
        'normal',
        'high'
    );
}
add_action( 'add_meta_boxes', 'lp_add_location_meta_boxes' );

/**
 * Meta Box HTML Output
 */
function lp_location_meta_box_html( $post ) {
    // Retrieve existing values from the database
    $lat = get_post_meta( $post->ID, '_lp_lat', true );
    $lng = get_post_meta( $post->ID, '_lp_lng', true );

    // Security field (Nonce) to prevent CSRF attacks
    wp_nonce_field( 'lp_save_location_meta', 'lp_location_nonce' );
    ?>
    <div class="lp-admin-map-wrapper">
        <div id="lp-admin-map" style="height: 300px; width: 100%; margin-bottom: 20px; background: #eee; border: 1px solid #ccc;">
            <p style="text-align: center; padding-top: 130px;">Loading Map...</p>
        </div>

        <div style="display: flex; gap: 20px;">
            <p style="flex: 1;">
                <label for="lp_lat"><strong><?php _e( 'Latitude', 'locator-pro' ); ?></strong></label><br>
                <input type="text" id="lp_lat" name="lp_lat" value="<?php echo esc_attr( $lat ); ?>" class="widefat" readonly>
            </p>
            <p style="flex: 1;">
                <label for="lp_lng"><strong><?php _e( 'Longitude', 'locator-pro' ); ?></strong></label><br>
                <input type="text" id="lp_lng" name="lp_lng" value="<?php echo esc_attr( $lng ); ?>" class="widefat" readonly>
            </p>
        </div>
        <p class="description">
            <?php _e( 'Click on the map to set the location. Coordinates update automatically.', 'locator-pro' ); ?>
        </p>
    </div>
    <?php
}

/**
 * Save Meta Box Data
 */
function lp_save_location_meta( $post_id ) {
    // 1. Verify Nonce for security
    if ( ! isset( $_POST['lp_location_nonce'] ) || ! wp_verify_nonce( $_POST['lp_location_nonce'], 'lp_save_location_meta' ) ) {
        return;
    }

    // 2. Check for Autosave
    if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
        return;
    }

    // 3. Check user permissions
    if ( ! current_user_can( 'edit_post', $post_id ) ) {
        return;
    }

    // 4. Sanitize and Save data
    if ( isset( $_POST['lp_lat'] ) ) {
        update_post_meta( $post_id, '_lp_lat', sanitize_text_field( $_POST['lp_lat'] ) );
    }
    if ( isset( $_POST['lp_lng'] ) ) {
        update_post_meta( $post_id, '_lp_lng', sanitize_text_field( $_POST['lp_lng'] ) );
    }
}
add_action( 'save_post', 'lp_save_location_meta' );

/**
 * Enqueue Leaflet and custom JS for the admin area
 */
function lp_admin_enqueue_scripts( $hook ) {
    global $post;

    // Only load on Location post type edit/new screens
    if ( $hook !== 'post.php' && $hook !== 'post-new.php' ) {
        return;
    }
    if ( get_post_type( $post ) !== 'location' ) {
        return;
    }

    // Load Leaflet CSS
    wp_enqueue_style( 'leaflet-css', 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css', array(), '1.9.4' );

    // Load Leaflet JS
    wp_enqueue_script( 'leaflet-js', 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js', array(), '1.9.4', true );

    // Load our custom admin map script
    wp_enqueue_script( 
        'lp-admin-map', 
        plugin_dir_url( __FILE__ ) . 'js/admin-map.js', 
        array( 'leaflet-js' ), 
        '1.0.0', 
        true 
    );
}
add_action( 'admin_enqueue_scripts', 'lp_admin_enqueue_scripts' );

/**
 * Register custom meta fields for the REST API
 */
function lp_register_rest_fields() {
    // Register Latitude
    register_rest_field( 'location', 'latitude', array(
        'get_callback' => function( $post_arr ) {
            return get_post_meta( $post_arr['id'], '_lp_lat', true );
        },
        'update_callback' => null,
        'schema'          => array(
            'description' => __( 'Location latitude.', 'locator-pro' ),
            'type'        => 'string',
        ),
    ));

    // Register Longitude
    register_rest_field( 'location', 'longitude', array(
        'get_callback' => function( $post_arr ) {
            return get_post_meta( $post_arr['id'], '_lp_lng', true );
        },
        'update_callback' => null,
        'schema'          => array(
            'description' => __( 'Location longitude.', 'locator-pro' ),
            'type'        => 'string',
        ),
    ));
}
add_action( 'rest_api_init', 'lp_register_rest_fields' );