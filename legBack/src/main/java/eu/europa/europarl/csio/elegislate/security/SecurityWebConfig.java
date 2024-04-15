package eu.europa.europarl.csio.elegislate.security;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Profile;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;

import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import ec.ep.dit.isp.security.spring.preauth.filter.JaasPreAuthenticatedProcessingFilter;
import ec.ep.dit.isp.security.spring.preauth.provider.JaasPreAuthenticatedAuthenticationProvider;
import eu.europa.europarl.csio.elegislate.security.domain.UserDetailsServiceImpl;



@EnableWebSecurity(debug = false)
@Profile(value = { "tomcat" })
public class SecurityWebConfig extends WebSecurityConfigurerAdapter  {
	
	@Autowired
	private UserDetailsServiceImpl userDetailsService;
	
	@Bean
	public JaasPreAuthenticatedProcessingFilter jaasPreAuthenticatedProcessingFilter() throws Exception {
		JaasPreAuthenticatedProcessingFilter jaasPreAuthFilter = new JaasPreAuthenticatedProcessingFilter();
		jaasPreAuthFilter.setAuthenticationManager(authenticationManager());
		return jaasPreAuthFilter;
	}
	
	@Bean
	public JaasPreAuthenticatedAuthenticationProvider jaasAuthenticatedProvider() {
		JaasPreAuthenticatedAuthenticationProvider jaasAuthenticatedProvider = new JaasPreAuthenticatedAuthenticationProvider();
		jaasAuthenticatedProvider.setPreAuthenticatedUserDetailsService(userDetailsService);
		return jaasAuthenticatedProvider;
	}

	/*
	@Bean
	public AjaxLogoutHandler ajaxLogoutHandler() {
		return new AjaxLogoutHandler();
	}
	*/
	@Override
	protected void configure(AuthenticationManagerBuilder auth) throws Exception {
		auth.authenticationProvider(jaasAuthenticatedProvider());
	}
	
	
	@Override
	protected void configure(HttpSecurity http) throws Exception {
		http.csrf().disable();
		http.formLogin();
		http.authorizeRequests()
		.antMatchers("/**").authenticated()
	
		//.antMatchers("/**").hasAnyAuthority("SYS_ADMIN","SYS_PROJECT","SYS_REPORT")
	.and()
		.addFilter(jaasPreAuthenticatedProcessingFilter())
		.sessionManagement().sessionCreationPolicy(SessionCreationPolicy.ALWAYS)
	.and()
		.authenticationProvider(jaasAuthenticatedProvider());
		
		
	}
	
	@Bean
	public CorsConfigurationSource corsConfigurationSource() {
		final UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", new CorsConfiguration().applyPermitDefaultValues());
		return source;
	}
	
}
