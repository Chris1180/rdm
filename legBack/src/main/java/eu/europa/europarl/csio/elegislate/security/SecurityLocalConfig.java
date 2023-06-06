package eu.europa.europarl.csio.elegislate.security;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.crypto.password.NoOpPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import eu.europa.europarl.csio.elegislate.security.domain.UserDetailsServiceImpl;



@Configuration
@EnableWebSecurity(debug = false)
@Profile("!tomcat")
public class SecurityLocalConfig extends WebSecurityConfigurerAdapter {

	@Autowired
	private UserDetailsServiceImpl userDetailsService;

	/*
	@Bean
	public AjaxLogoutHandler ajaxLogoutHandler() {
		return new AjaxLogoutHandler();
	}*/

	@Override
	protected void configure(HttpSecurity http) throws Exception {
		http.csrf().disable();
		http.formLogin(); // form login de spring boot security
		http.logout();
		http.httpBasic();
		http.cors().configurationSource(corsConfigurationSource());
		
		http.authorizeRequests()
			.antMatchers("/rules","/update","/delete","/language","/styles","/export","/test","/listServices","/getActivities","/getUserServices").permitAll()
			.anyRequest().authenticated();

		//http
			//.authorizeRequests()
			//.antMatchers("/**")
			//.hasAnyAuthority("SYS_ADMIN", "SYS_PROJECT")
			//.antMatchers("/login*").permitAll()
		    //.anyRequest().authenticated();
			//.and()
		    //.addFilter(new BasicAuthenticationFilter(authenticationManager())).sessionManagement()
		    //.sessionCreationPolicy(SessionCreationPolicy.ALWAYS);
		    //.and().csrf().disable();
		//http.exceptionHandling().accessDeniedPage("/notAuthorized");
		// login/logout
		//http.logout().logoutUrl(RestConstants.LOGOUT_API).logoutSuccessHandler(ajaxLogoutHandler());
	}

	@Bean(name = "passwordEncoder")
	public PasswordEncoder passwordEncoder() {
		return NoOpPasswordEncoder.getInstance();
	}

	@Bean
	public CorsConfigurationSource corsConfigurationSource() {
		final UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", new CorsConfiguration().applyPermitDefaultValues());
		return source;
	}
	
}


