package com.knowledge.blog.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import org.springframework.web.util.HtmlUtils;

import java.util.regex.Pattern;

public class PostContentValidator implements ConstraintValidator<ValidPostContent, String> {
    private static final Pattern IMAGE_PATTERN = Pattern.compile(
            "<img\\b[^>]*\\bsrc\\s*=\\s*(?:\"[^\"]+\"|'[^']+'|[^\\s>]+)",
            Pattern.CASE_INSENSITIVE
    );
    private static final Pattern HTML_TAG_PATTERN = Pattern.compile("<[^>]*>");

    @Override
    public boolean isValid(String content, ConstraintValidatorContext context) {
        if (content == null || content.isBlank()) return false;
        if (IMAGE_PATTERN.matcher(content).find()) return true;

        String visibleText = HtmlUtils.htmlUnescape(HTML_TAG_PATTERN.matcher(content).replaceAll(" "))
                .replace('\u00a0', ' ')
                .replaceAll("\\s+", " ")
                .trim();
        return !visibleText.isEmpty();
    }
}
