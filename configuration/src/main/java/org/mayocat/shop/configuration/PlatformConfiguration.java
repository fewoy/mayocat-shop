package org.mayocat.shop.configuration;

import java.util.Map;

import javax.validation.Valid;

import org.mayocat.shop.configuration.thumbnails.Dimensions;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.common.collect.Maps;

/**
 * @version $Id$
 */
public class PlatformConfiguration
{
    @Valid
    @JsonProperty
    private Map<String, Dimensions> thumbnails = Maps.newHashMap();

    public Map<String, Dimensions> getThumbnails()
    {
        return thumbnails;
    }
}
